# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.1/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.9] - 2025-06-30

### Fixed
- Fixed method names in README API documentation to match implementation:
  - `keys()` → `getKeys()`
  - `values()` → `getValues()`
  - `indexes()` → `getIndexes()`
  - `entries()` → `getEntries()`
  - `Key()` → `getKey()`
  - `Value()` → `getValue()`
  - `Index()` → `getIndex()`
- Removed duplicate quick start/example sections in README
- Fixed type inconsistencies in method signatures

### Added
- Added comprehensive "Performance & Benefits" section to README
- Added detailed comparison with native enums, string unions, and const objects
- Enhanced documentation with more examples and usage patterns
- Added more detailed JSDoc comments to all interfaces and methods

### Changed
- Reorganized README for better readability and flow
- Moved performance section to the top of the README for better visibility
- Improved type safety in enum factory implementation
- Enhanced error messages for better debugging

### Removed
- Removed redundant `Type` property from enum factory
- Removed duplicate validation methods in favor of consistent naming

## [1.0.8] - 2025-06-26

### Fixed
- Fixed type definitions to ensure enum properties are non-nullable
- Removed the need for non-null assertions when accessing enum values
- Improved type safety for enum property access

### Added
- Added comprehensive type safety tests for enum property access
- Added test case for using enum values in configuration objects

## [1.0.7] - 2025-06-26

### Added
- Added comprehensive README documentation with usage examples
- Added badges for npm version, license, build status, code coverage, bundle size, and TypeScript version
- Added feature comparison table with other enum approaches

### Fixed
- Updated type documentation to use `type EnumName = SafeEnum` consistently
- Improved type safety in test files

### Changed
- Enhanced documentation with better examples and type usage guides
- Improved code style consistency across the project


## [1.0.6] - 2025-06-25

### Added
- New instance methods for guaranteed non-null access:
  - `Key()` - Returns the enum key (throws if undefined)
  - `Value()` - Returns the enum value (throws if undefined)
  - `Index()` - Returns the enum index (throws if undefined)
- Added `.type` getter for ergonomic type extraction
- Enhanced runtime safety with explicit accessors that fail fast on undefined values

## [1.0.5] - 2025-06-13

### Added
- Enhanced test coverage for mixed explicit and auto-indexed enums
- Added more detailed error messages for duplicate index detection

### Fixed
- Fixed auto-indexing logic to correctly handle mixed explicit and implicit indices
- Resolved issue where auto-indexing would start from 0 even when higher indices were already in use
- Improved type safety in test files with proper null checks
- Fixed variable naming consistency in test cases

### Changed
- Updated test assertions to better document expected behavior
- Improved code organization and comments for better maintainability

## [1.0.4] - 2025-06-13

### Added
- New `CreateSafeEnumFromArray` helper for creating enums from string arrays
- Made `index` property optional in `SafeEnum` interface with auto-indexing support
- Improved type inference for better developer experience

### Changed
- Updated documentation and examples to reflect the new helper function
- Improved error messages for invalid enum configurations

### Fixed
- Fixed type issues with optional index values
- Resolved circular dependency issues in type definitions

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
