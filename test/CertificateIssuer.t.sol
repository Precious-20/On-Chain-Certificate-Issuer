// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {CertificateIssuer} from "../src/CertificateIssuer.sol";

contract CertificateIssuerTest is Test {
    CertificateIssuer certificateIssuer;

    address student;

    function setUp() public {
        certificateIssuer = new CertificateIssuer();
        student = makeAddr("student");
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

    function testNonOwnerCannotIssueCertificate() public {
        vm.prank(student);

        vm.expectRevert(
    CertificateIssuer.NotAuthorized.selector
    );

        certificateIssuer.issueCertificate(
            student,
            "Precious Orisajo",
            "Web3 Blockchain",
            "TechCrush"
        );
    }

    function testNonOwnerCannotRevokeCertificate() public {
        certificateIssuer.issueCertificate(
            student,
            "Precious Orisajo",
            "Web3 Blockchain",
            "TechCrush"
        );

        vm.prank(student);

        vm.expectRevert(
    CertificateIssuer.NotAuthorized.selector
    );

        certificateIssuer.revokeCertificate(1);
    }

    function testMultipleCertificates() public {
    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Cybersecurity",
        "TechCrush"
    );

    CertificateIssuer.Certificate memory cert1 =
        certificateIssuer.verifyCertificate(1);

    CertificateIssuer.Certificate memory cert2 =
        certificateIssuer.verifyCertificate(2);

    assertEq(cert1.id, 1);
    assertEq(cert2.id, 2);
    assertEq(cert1.course, "Web3 Blockchain");
    assertEq(cert2.course, "Cybersecurity");
}

function testCertificateIsValidWhenIssued() public {
    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    CertificateIssuer.Certificate memory cert =
        certificateIssuer.verifyCertificate(1);

    assertFalse(cert.revoked);
}

function testVerifyNonexistentCertificate() public {
    vm.expectRevert(CertificateIssuer.CertificateDoesNotExist.selector);

    certificateIssuer.verifyCertificate(999);
}

function testRevokeNonexistentCertificate() public {
    vm.expectRevert(CertificateIssuer.CertificateDoesNotExist.selector);

    certificateIssuer.revokeCertificate(999);
}

function testCannotRevokeCertificateTwice() public {
    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    certificateIssuer.revokeCertificate(1);

    vm.expectRevert(
        CertificateIssuer.CertificateAlreadyRevoked.selector
    );

    certificateIssuer.revokeCertificate(1);
}

function testCertificateIsValid() public {
    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    assertTrue(certificateIssuer.isCertificateValid(1));
}

function testRevokedCertificateIsInvalid() public {
    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    certificateIssuer.revokeCertificate(1);

    assertFalse(certificateIssuer.isCertificateValid(1));
}

function testValidityCheckForNonexistentCertificate() public {
    vm.expectRevert(
        CertificateIssuer.CertificateDoesNotExist.selector
    );

    certificateIssuer.isCertificateValid(999);
}

function testAuthorizedIssuerCanIssueCertificate() public {
    address issuer = makeAddr("issuer");

    certificateIssuer.authorizeIssuer(issuer);

    vm.prank(issuer);

    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );

    CertificateIssuer.Certificate memory cert =
        certificateIssuer.verifyCertificate(1);

    assertEq(cert.recipient, student);
}

function testUnauthorizedIssuerCannotIssueCertificate() public {
    address issuer = makeAddr("issuer");

    vm.prank(issuer);

    vm.expectRevert(
    CertificateIssuer.NotAuthorized.selector
    );

    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );
}

function testRemovedIssuerCannotIssueCertificate() public {
    address issuer = makeAddr("issuer");

    certificateIssuer.authorizeIssuer(issuer);
    certificateIssuer.removeIssuer(issuer);

    vm.prank(issuer);

    vm.expectRevert(
        CertificateIssuer.NotAuthorized.selector
    );

    certificateIssuer.issueCertificate(
        student,
        "Precious Orisajo",
        "Web3 Blockchain",
        "TechCrush"
    );
}

function testNonOwnerCannotAuthorizeIssuer() public {
    address issuer = makeAddr("issuer");

    vm.prank(issuer);

    vm.expectRevert(
        CertificateIssuer.NotAuthorized.selector
    );

    certificateIssuer.authorizeIssuer(issuer);
}

function testNonOwnerCannotRemoveIssuer() public {
    address issuer = makeAddr("issuer");

    certificateIssuer.authorizeIssuer(issuer);

    vm.prank(issuer);

    vm.expectRevert(
    CertificateIssuer.NotAuthorized.selector
    );

    certificateIssuer.removeIssuer(issuer);
}

function testIssuerAuthorizationStatus() public {
    address issuer = makeAddr("issuer");

    assertFalse(certificateIssuer.authorizedIssuers(issuer));

    certificateIssuer.authorizeIssuer(issuer);

    assertTrue(certificateIssuer.authorizedIssuers(issuer));

    certificateIssuer.removeIssuer(issuer);

    assertFalse(certificateIssuer.authorizedIssuers(issuer));
}
}