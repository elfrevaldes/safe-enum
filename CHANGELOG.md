# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.1/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.33] - 2025-05-29

### Changed
- Updated README with clearer feature descriptions for runtime validation and bi-directional mapping

## [1.0.32] - 2025-05-29

### Added
- Test coverage for enum value immutability
- Test coverage for error handling when enum entry is missing an index

### Fixed
- Fixed test for missing index error case
- Improved test reliability and coverage


## [1.0.31] - 2025-05-29

### Changed
- Bump version to 1.0.31 for npm republish

## [1.0.3] - 2025-05-29

### Changed
- Bump version to 1.0.3 for npm republish

## [1.0.1] - 2025-05-29

### Added
- `values()` - Returns array of enum values as strings
- `indexes()` - Returns array of enum indices as numbers
- `getEntries()` - Returns array of full enum value objects
- Better type safety and documentation

### Changed
- Renamed methods for better consistency and clarity:
  - Old `values()` → `getEntries()`
  - Old `getValues()` → `values()`
  - Old `getIndexes()` → `indexes()`
- Improved error messages for duplicate indices
- Updated documentation with accurate method signatures and examples

### Fixed
- Fixed type definitions for better TypeScript support
- Corrected iterator behavior to match documentation

## [1.0.0] - 2025-05-28

### Changed
- Bumped version to 1.0.0
- Bring back support for Node.js 18+
- Updated dev dependencies to their latest versions
- Initial release
- Core enum functionality
- TypeScript type definitions
- Unit tests
- Documentation

[Unreleased]: https://github.com/elfrevaldes/safe-enum/compare/v1.0.31...HEAD
[1.0.31]: https://github.com/elfrevaldes/safe-enum/releases/tag/v1.0.31
[1.0.3]: https://github.com/elfrevaldes/safe-enum/releases/tag/v1.0.3
[1.0.1]: https://github.com/elfrevaldes/safe-enum/releases/tag/v1.0.1
