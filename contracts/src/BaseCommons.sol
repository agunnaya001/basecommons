// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseCommons
 * @author agunnaya001
 * @notice Quadratic Funding Pool — built for Base
 * @dev Projects register on-chain, donors contribute ETH, admin distributes
 *      matching funds using the quadratic funding formula (sum of sqrt)^2
 *
 *      QF Formula:
 *        match_i = pool × (Σⱼ √donationⱼᵢ)² / Σₖ (Σⱼ √donationⱼₖ)²
 *
 *      Where j iterates over unique donors to project i.
 *      Many small donors beat one large donor — community breadth is rewarded.
 */
contract BaseCommons {

    /* ──────────────────────────────────────────────────────
       STRUCTS
    ────────────────────────────────────────────────────── */
    struct Project {
        uint256 id;
        string  name;
        string  description;
        string  imageURI;
        address payable recipient;
        bool    active;
        uint256 totalDonations;   // raw ETH donated (wei)
        uint256 donorCount;       // unique donors this cycle
    }

    /* ──────────────────────────────────────────────────────
       STATE
    ────────────────────────────────────────────────────── */
    address public immutable admin;

    uint256 public projectCount;
    uint256 public matchingPool;
    uint256 public cycleId;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public donorAmounts;
    mapping(uint256 => address[]) private _donors;
    mapping(uint256 => mapping(address => bool)) private _donorTracked;

    /* ──────────────────────────────────────────────────────
       EVENTS
    ────────────────────────────────────────────────────── */
    event ProjectRegistered(
        uint256 indexed projectId,
        address indexed recipient,
        string  name,
        string  imageURI
    );

    event Donation(
        address indexed donor,
        uint256 indexed projectId,
        uint256 amount,
        uint256 cycleId
    );

    event MatchingPoolFunded(address indexed funder, uint256 amount);

    event MatchingDistributed(
        uint256 indexed cycleId,
        uint256 totalPool,
        uint256 projectCount
    );

    event MatchingAllocated(
        uint256 indexed cycleId,
        uint256 indexed projectId,
        uint256 amount
    );

    event ProjectDeactivated(uint256 indexed projectId);

    /* ──────────────────────────────────────────────────────
       ERRORS
    ────────────────────────────────────────────────────── */
    error NotAdmin();
    error EmptyName();
    error ZeroDonation();
    error InvalidProject();
    error ProjectInactive();
    error EmptyPool();
    error NoProjects();
    error ZeroAdmin();

    /* ──────────────────────────────────────────────────────
       MODIFIERS
    ────────────────────────────────────────────────────── */
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    /* ──────────────────────────────────────────────────────
       CONSTRUCTOR
    ────────────────────────────────────────────────────── */
    constructor(address _admin) {
        if (_admin == address(0)) revert ZeroAdmin();
        admin   = _admin;
        cycleId = 1;
    }

    /* ──────────────────────────────────────────────────────
       PROJECT REGISTRATION
    ────────────────────────────────────────────────────── */
    /**
     * @notice Register a new project. Caller becomes the recipient.
     * @param name        Short project name
     * @param description Project description
     * @param imageURI    IPFS/HTTP URI for project image
     */
    function registerProject(
        string calldata name,
        string calldata description,
        string calldata imageURI
    ) external returns (uint256 projectId) {
        if (bytes(name).length == 0) revert EmptyName();

        projectId = ++projectCount;

        projects[projectId] = Project({
            id:             projectId,
            name:           name,
            description:    description,
            imageURI:       imageURI,
            recipient:      payable(msg.sender),
            active:         true,
            totalDonations: 0,
            donorCount:     0
        });

        emit ProjectRegistered(projectId, msg.sender, name, imageURI);
    }

    /**
     * @notice Admin can deactivate a project (e.g., for abuse prevention).
     */
    function deactivateProject(uint256 projectId) external onlyAdmin {
        if (projectId == 0 || projectId > projectCount) revert InvalidProject();
        projects[projectId].active = false;
        emit ProjectDeactivated(projectId);
    }

    /* ──────────────────────────────────────────────────────
       DONATIONS
    ────────────────────────────────────────────────────── */
    /**
     * @notice Donate ETH to a project.
     * @param projectId The project to fund
     */
    function donate(uint256 projectId) external payable {
        if (msg.value == 0) revert ZeroDonation();
        if (projectId == 0 || projectId > projectCount) revert InvalidProject();
        if (!projects[projectId].active) revert ProjectInactive();

        Project storage project = projects[projectId];

        if (!_donorTracked[projectId][msg.sender]) {
            _donorTracked[projectId][msg.sender] = true;
            _donors[projectId].push(msg.sender);
            project.donorCount++;
        }

        donorAmounts[projectId][msg.sender] += msg.value;
        project.totalDonations             += msg.value;

        // Forward donation directly to recipient
        project.recipient.transfer(msg.value);

        emit Donation(msg.sender, projectId, msg.value, cycleId);
    }

    /* ──────────────────────────────────────────────────────
       MATCHING POOL FUNDING
    ────────────────────────────────────────────────────── */
    function fundMatchingPool() external payable {
        if (msg.value == 0) revert ZeroDonation();
        matchingPool += msg.value;
        emit MatchingPoolFunded(msg.sender, msg.value);
    }

    receive() external payable {
        matchingPool += msg.value;
        emit MatchingPoolFunded(msg.sender, msg.value);
    }

    /* ──────────────────────────────────────────────────────
       QUADRATIC FUNDING DISTRIBUTION
    ────────────────────────────────────────────────────── */
    /**
     * @notice Admin triggers QF matching fund distribution.
     * @dev share = (sqrtSum_i / totalSqrtSum)^2 * pool
     *      We scale by 1e9 for integer sqrt precision.
     */
    function distributeMatching() external onlyAdmin {
        if (matchingPool == 0) revert EmptyPool();
        if (projectCount == 0) revert NoProjects();

        uint256 pool         = matchingPool;
        uint256 currentCycle = cycleId;

        // CEI: zero pool immediately to prevent reentrancy
        matchingPool = 0;

        uint256[] memory sqrtSums = new uint256[](projectCount);
        uint256 totalSqrtSum      = 0;

        for (uint256 pid = 1; pid <= projectCount; pid++) {
            if (!projects[pid].active) continue;
            address[] storage donors = _donors[pid];
            uint256 pSqrtSum = 0;

            for (uint256 d = 0; d < donors.length; d++) {
                uint256 amt = donorAmounts[pid][donors[d]];
                if (amt > 0) pSqrtSum += _sqrt(amt * 1e9);
            }

            sqrtSums[pid - 1] = pSqrtSum;
            totalSqrtSum      += pSqrtSum;
        }

        if (totalSqrtSum == 0) {
            payable(admin).transfer(pool);
            _resetCycle();
            return;
        }

        uint256 distributed = 0;

        for (uint256 pid = 1; pid <= projectCount; pid++) {
            uint256 sqrtSum = sqrtSums[pid - 1];
            if (sqrtSum == 0 || !projects[pid].active) continue;

            uint256 numerator   = sqrtSum * sqrtSum;
            uint256 denominator = totalSqrtSum * totalSqrtSum;
            uint256 matchAmount = (pool * numerator) / denominator;

            if (matchAmount > 0) {
                distributed += matchAmount;
                projects[pid].recipient.transfer(matchAmount);
                emit MatchingAllocated(currentCycle, pid, matchAmount);
            }
        }

        uint256 remainder = pool - distributed;
        if (remainder > 0) payable(admin).transfer(remainder);

        emit MatchingDistributed(currentCycle, pool, projectCount);
        _resetCycle();
    }

    /* ──────────────────────────────────────────────────────
       VIEW HELPERS
    ────────────────────────────────────────────────────── */
    function getAllProjectIds() external view returns (uint256[] memory ids) {
        ids = new uint256[](projectCount);
        for (uint256 i = 0; i < projectCount; i++) ids[i] = i + 1;
    }

    function getDonors(uint256 projectId) external view returns (address[] memory) {
        return _donors[projectId];
    }

    function estimateMatching()
        external
        view
        returns (uint256[] memory ids, uint256[] memory amounts)
    {
        ids     = new uint256[](projectCount);
        amounts = new uint256[](projectCount);

        if (matchingPool == 0 || projectCount == 0) return (ids, amounts);

        uint256[] memory sqrtSums = new uint256[](projectCount);
        uint256 totalSqrtSum      = 0;

        for (uint256 pid = 1; pid <= projectCount; pid++) {
            ids[pid - 1] = pid;
            if (!projects[pid].active) continue;
            address[] storage donors = _donors[pid];
            uint256 pSqrtSum = 0;
            for (uint256 d = 0; d < donors.length; d++) {
                uint256 amt = donorAmounts[pid][donors[d]];
                if (amt > 0) pSqrtSum += _sqrt(amt * 1e9);
            }
            sqrtSums[pid - 1] = pSqrtSum;
            totalSqrtSum      += pSqrtSum;
        }

        if (totalSqrtSum == 0) return (ids, amounts);

        uint256 pool = matchingPool;
        for (uint256 pid = 1; pid <= projectCount; pid++) {
            uint256 s = sqrtSums[pid - 1];
            if (s == 0) continue;
            amounts[pid - 1] = (pool * s * s) / (totalSqrtSum * totalSqrtSum);
        }
    }

    /* ──────────────────────────────────────────────────────
       INTERNAL
    ────────────────────────────────────────────────────── */
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function _resetCycle() internal {
        cycleId++;
        for (uint256 pid = 1; pid <= projectCount; pid++) {
            address[] storage donors = _donors[pid];
            for (uint256 d = 0; d < donors.length; d++) {
                delete donorAmounts[pid][donors[d]];
                delete _donorTracked[pid][donors[d]];
            }
            delete _donors[pid];
            projects[pid].totalDonations = 0;
            projects[pid].donorCount     = 0;
        }
    }
}
