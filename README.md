<img src="apps/desktop/assets/llavero-logo.png" width="200" >

**My hardware wallet as MY service**

Llavero means keyring in spanish. “Lla” is pronounced as “Ya” in Yacht or SHA

Llavero is a self-service, non-custodial wallet that uses [AWS KMS](https://aws.amazon.com/kms/faqs/) for secure key management, offering a custodial user experience.

## Table of Contents

- [Introduction](#introduction)
  - [Software as MY Service (SaMS)](#software-as-my-service-sams)
  - [KMS](#kms)
  - [Llavero's features](#llaveros-features)
    - [Wallet comparisons](#wallet-comparisons)
    - [Status \& contributions](#status--contributions)
  - [Objectives](#objectives)
    - [Why all this?](#why-all-this)
    - [Philosophy](#philosophy)
- [Installation](#installation)
  - [Manual/Dev Installation](#manualdev-installation)
  - [Desktop Installer](#desktop-installer)
  - [Differences between Fork and Desktop Installer](#differences-between-fork-and-desktop-installer)
- [Develop](#develop)
  - [To Dev:](#to-dev)
    - [To emulate next.js prod on local env](#to-emulate-nextjs-prod-on-local-env)
- [Roadmap and proposals](#roadmap-and-proposals)
- [Components and architecture](#components-and-architecture)
  - [Installer](#installer)
  - [Web](#web)

# Introduction

**Llavero: My hardware wallet as MY service. What does this mean?**

### Software as MY Service (SaMS)

**As MY services** mean that is a self-hosted service. It’s your cloud stack: buckets, DB, CDN, authentication and authorization services, and KMS, without intermediaries. Is a cloud stack design for just one person, as cost-effective as possible, taking advantage of the generous free tier major cloud companies offer.

We are used to the Software as a Service (SaaS) paradigm, where intermediate companies such as OpenZeppelin or DropBox deliver high-quality products to end users, using major cloud companies as vendors. With Software as MY Service (SaMS), the end user can host their services, maintaining absolute control, autonomy and privacy over their digital assets.

### KMS

Major cloud companies like AWS, Azure and Google Cloud offer a service generically referred to as KMS (Key management service).
KMS is a managed service that simplifies the creation and control of cryptographic keys used to protect data. AWS KMS employs Hardware Security Modules (hardware security modules) to safeguard and validate KMS keys under the [FIPS 140-2 Cryptographic Module Validation Program](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html).
HSMs can be thought of as cloud-based hardware wallets, such as Trezor or Ledger, but in the cloud, secured by [AWS’s data centers](https://aws.amazon.com/compliance/data-center/controls/).

AWS KMS is a service where all private keys are securely stored. These keys, generated within the HSM, never leave it. All signing operations are executed within the KMS a concept also known as Cryptography as a Service.

Prominent companies like [OpenZeppelin©](https://www.openzeppelin.com/) leader in the security industry, use AWS KMS to store keys on [Defender](https://docs.openzeppelin.com/defender/v2/manage/relayers#security-considerations). [Defender](https://docs.openzeppelin.com/defender/v2/manage/relayers#security-considerations) assists Blockchain companies in signing and securing their crypto assets.

## Llavero's features

- Always Recover: User-friendly setup and recovery.
- Enterprise Security: [AWS’s data centers](https://aws.amazon.com/compliance/data-center/controls/). Multiple security layers. MFA (SMS, EMAIL, TOTP, Biometrics (Passkeys))
- Full Privacy: Your infrastructure. Encryption at rest
- Protect Transactions: Whitelist address, MFA, multi-signature approval.
- Wallet Connect
- Built with well-known components: Next.js, Ethers.js, CDK and SST, Electron, AWS Cognito, AWS KMS

### Wallet comparisons

|                               | Custodial  | Software | Hardware | Llavero           |
| ----------------------------- | ---------- | -------- | -------- | ----------------- |
| **Setup time**                | 1min + KYC | 5 min    | 5 min    | 5 min             |
| **Phrase vulnerabilities**    | NO         | YES      | YES      | NO                |
| **MFA (EMAIL, Biometrics)**   | YES        | FEW      | NO       | YES               |
| **Censorship Resistant**      | NO         | YES      | YES      | NO, but difficult |
| **Protect any digital asset** | NO         | NO       | NO       | Yes               |

### Status & contributions

Currently, Llavero is an MVP. Is a basic EVM wallet with WalletConnect support. Many security layers aren't yet developed. Such as Passkeys, a good penetration test, create many tests.

So if you are a developer, a web security specialist or QA tester that you wanna contribute great!

If you are a cloud architect or security specialist and you wanna participate in architecture and/or security layers proposal also you are very welcome :)

## Objectives

**Objective:** Effortless Secure Self-Custody

**Path:** Identity decentralization

Can open source create an IaC solution for personal use – easy, secure, 100% private, cheap, and censorship-resistant?

Why? For absolute privacy, security, ease of use, and resilience to secure my assets and personal verifiable credentials.

A self-service should be designed to be for a single user. The user should have hardware isolation to maintain his full privacy. It should not be designed to scale, since is just for one user.

It should be resilient; the end user should not have to spend time maintaining their services.

It should be hardware-agnostic or cloud-agnostic. The user should be able to migrate from one cloud to another.

Ideally, it should be resistant to censorship. If the solution is multi-infrastructure, even if AWS closes your account, you should be able to continue working and not lose anything on another cloud or personal hardware.

### Why all this?

First, because we can :) It should be easy, affordable, and fully private.

Second, in the coming years, our digital identity will be compromised by AI. We need to think of new ways to deliver a technology solution for end users that is easy, secure, private, and fully autonomous.

### Philosophy

Technology to the people. Provide the best technology as possible to end-users at an affordable cost.

# Installation

Llavero wallet currently has two types of installations. One for devs, using Github Actions and another for regular users with a desktop installer for Windows, Mac and Linux.

## Steps and Requirements

1. [Guide: Create a AWS Account](docs/aws-account.md)
2. [Guide: Create Aws root credentials for installation](docs/create-credentials.md)
3. Choose your installation. By Forking or download your Desktop OS Installer

## Fork Installation

- [Full fork installation Guide](docs/fork-llavero.md)

- Small version:
  1. Fork this repo
  2. Add the following secrets on your repo:
  - AWS_ACCESS_KEY_ID: the created KEY Id
  - AWS_SECRET_ACCESS_KEY : the created Secret Key
  - EMAIL : the email for account recovery and login.
  - REGION : us-east-1
  - NUMBER_OF_KEYS (optional default: 1): The number of KMS to be created
  3. Run the Github action: "GithubAction Installer"
  4. Wait, approx 20 min, an get on your email your temporary password and login

## Desktop Installer

download - SOON

## Differences between Fork and Desktop Installer

The Fork installer just run the SST (CDK) Stack on the GIthub action. The user has to update manually each time by pulling from the original repo.

The Desktop install creates a AWS CodePipeline. The SST stack is run on AWS on the AWS Codepipeline. On the Desktop installation the user can setup if Llavero is updated automatically each time the Llavero's Repo has a new release. The AWS Codepipeline tier has a free tier, but is more limited than the GH Action tier. So cost can increase if Llavero releases many versions on the same month.

# Develop

## To Dev:

```
Terminal 1

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn start-sst

Terminal 2

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn dev
```

### To emulate next.js prod on local env

```
Terminal 1

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn start-sst

Terminal 2

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn workspace web sst bind next build
EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn workspace web sst bind next start
```

# Roadmap and proposals

- AWS KMS Replica
- Passkeys and/or Mobile App
- Tokens ERC20 and NFT
- Root user security
- Service cloak
- Multi-chain wallet
- Container installation

# components and architecture

## Installer

## Web
