// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {CertificateIssuer} from "../src/CertificateIssuer.sol";

contract CertificateIssuerTest is Test {
    CertificateIssuer certificateIssuer;

    address student = makeAddr("student");

    function setUp() public {
        certificateIssuer = new CertificateIssuer();
    }

    function testIssueCertificate() public {
        certificateIssuer.issueCertificate(
            student,
            "Precious Orisajo",
            "Web3 Blockchain",
            "TechCrush"
        );

        CertificateIssuer.Certificate memory cert =
            certificateIssuer.verifyCertificate(1);

        assertEq(cert.recipient, student);
        assertEq(cert.recipientName, "Precious Orisajo");
        assertEq(cert.course, "Web3 Blockchain");
        assertEq(cert.institution, "TechCrush");
        assertFalse(cert.revoked);
    }

    function testRevokeCertificate() public {
    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    certificateIssuer.revokeCertificate(1);

    CertificateIssuer.Certificate memory cert =
        certificateIssuer.verifyCertificate(1);

    assertTrue(cert.revoked);
}
}