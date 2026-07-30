# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Generic Design DNA registry and resolver.
- Design DNA validation and JSON Schema.
- ZENA Enterprise SaaS Design DNA preset integration.
- Regression and contract test coverage.
- Continuous integration for pull requests.
- Repository CODEOWNERS.
- Controlled manual release workflow.

### Changed

- Design DNA activation now runs before catalog and custom theme dispatch.

### Fixed

- Unknown Design DNA references stop dispatch instead of falling through to catalog themes.
- Plain project design systems no longer fall through to theme selection.
- Malformed registry entries no longer crash validation.
