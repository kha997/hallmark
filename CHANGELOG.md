# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## 1.1.0 — YYYY-MM-DD

### Added

- Generic Design DNA registry and resolver.
- Design DNA validation and JSON Schema.
- ZENA Enterprise SaaS Design DNA preset integration.
- Regression and contract test coverage.
- Continuous integration validation for pull requests.
- Repository CODEOWNERS for critical paths.
- Branch protection for `main`.
- Controlled release workflow with manual dispatch.

### Changed

- SKILL.md activation model: Design DNA check (Step 0.5) runs before catalog/custom dispatch.

### Fixed

- Unknown DNA references now hard-stop dispatch instead of falling through to catalog themes.
- Plain `design.md` routing no longer drifts into custom/catalog selection.
- Malformed registry entries no longer crash the validation engine.
