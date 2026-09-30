// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract CertificateIssuer {
    error CertificateDoesNotExist();
    error CertificateAlreadyRevoked();
    error NotAuthorized();

    struct Certificate {
        uint256 id;
        address recipient;
        string recipientName;
        string course;
        string institution;
        uint256 issueDate;
        bool revoked;
    }

    address public immutable owner;

    mapping(address => bool) public authorizedIssuers;

    event IssuerAuthorized(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotAuthorized();
        }
        _;
    }

    modifier onlyIssuer() {
        if (msg.sender != owner && !authorizedIssuers[msg.sender]) {
            revert NotAuthorized();
        }
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function removeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    uint256 private nextCertificateId = 1;

    mapping(uint256 => Certificate) private certificates;

    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed recipient,
        string recipientName,
        string course,
        string institution,
        uint256 issueDate
    );

    event CertificateRevoked(uint256 indexed certificateId);

    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory course,
        string memory institution
    ) public onlyIssuer {
        uint256 certificateId = nextCertificateId;

        certificates[certificateId] = Certificate({
            id: certificateId,
            recipient: recipient,
            recipientName: recipientName,
            course: course,
            institution: institution,
            issueDate: block.timestamp,
            revoked: false
        });

        nextCertificateId++;

        emit CertificateIssued(certificateId, recipient, recipientName, course, institution, block.timestamp);
    }

    function verifyCertificate(uint256 certificateId) public view returns (Certificate memory) {
        if (certificateId == 0 || certificateId >= nextCertificateId) {
            revert CertificateDoesNotExist();
        }

        return certificates[certificateId];
    }

    function isCertificateValid(uint256 certificateId) public view returns (bool) {
        if (certificateId == 0 || certificateId >= nextCertificateId) {
            revert CertificateDoesNotExist();
        }

        return !certificates[certificateId].revoked;
    }

    function revokeCertificate(uint256 certificateId) public onlyOwner {
        if (certificateId == 0 || certificateId >= nextCertificateId) {
            revert CertificateDoesNotExist();
        }

        if (certificates[certificateId].revoked) {
            revert CertificateAlreadyRevoked();
        }

        certificates[certificateId].revoked = true;

        emit CertificateRevoked(certificateId);
    }
}
