// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract CertificateIssuer {

    struct Certificate {
        uint256 id;
        address recipient;
        string recipientName;
        string course;
        string institution;
        uint256 issueDate;
        bool revoked;
    }

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
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

    event CertificateRevoked(
        uint256 indexed certificateId
    );

    function issueCertificate(
    address recipient,
    string memory recipientName,
    string memory course,
    string memory institution
) public onlyOwner {
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

    emit CertificateIssued(
        certificateId,
        recipient,
        recipientName,
        course,
        institution,
        block.timestamp
    );
}


function verifyCertificate(uint256 certificateId)
    public
    view
    returns (Certificate memory)
{
    return certificates[certificateId];
}

function revokeCertificate(uint256 certificateId) public onlyOwner {
    certificates[certificateId].revoked = true;

    emit CertificateRevoked(certificateId);
}
}