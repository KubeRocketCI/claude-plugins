#!/usr/bin/env python3
"""
Pipeline Name Generator for EDP-Tekton

This script generates valid pipeline names following KRCI naming conventions.
It validates inputs and produces both build and review pipeline names.

Usage:
    python generate-pipeline.py <vcs> <language> <framework>
    python generate-pipeline.py --validate <pipeline-name>

Examples:
    python generate-pipeline.py github java springboot
    python generate-pipeline.py gitlab python fastapi
    python generate-pipeline.py --validate github-java-springboot-app-build-default
"""

import sys
import re
from typing import Tuple, Optional


# Supported VCS providers
SUPPORTED_VCS = ["github", "gitlab", "bitbucket"]

# Pipeline naming patterns
BUILD_PATTERN = "{vcs}-{language}-{framework}-app-build-default"
REVIEW_PATTERN = "{vcs}-{language}-{framework}-app-review"

# Validation regex for pipeline names
BUILD_REGEX = re.compile(
    r"^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-app-build-(default|edp)$"
)
REVIEW_REGEX = re.compile(
    r"^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-app-review$"
)


def validate_component(component: str, component_name: str) -> bool:
    """
    Validate a single component (vcs, language, framework).

    Args:
        component: The component value to validate
        component_name: Name of the component for error messages

    Returns:
        True if valid, False otherwise
    """
    if not component:
        print(f"Error: {component_name} cannot be empty", file=sys.stderr)
        return False

    if not re.match(r"^[a-z0-9-]+$", component):
        print(
            f"Error: {component_name} must contain only lowercase letters, "
            f"numbers, and hyphens. Got: {component}",
            file=sys.stderr
        )
        return False

    return True


def validate_vcs(vcs: str) -> bool:
    """Validate VCS provider."""
    if vcs not in SUPPORTED_VCS:
        print(
            f"Warning: VCS '{vcs}' is not in the list of commonly supported "
            f"providers: {', '.join(SUPPORTED_VCS)}. Proceeding anyway.",
            file=sys.stderr
        )
    return validate_component(vcs, "VCS")


def validate_pipeline_name(name: str) -> Tuple[bool, Optional[str]]:
    """
    Validate a full pipeline name against naming conventions.

    Args:
        name: The pipeline name to validate

    Returns:
        Tuple of (is_valid, pipeline_type)
        where pipeline_type is 'build', 'review', or None
    """
    if BUILD_REGEX.match(name):
        return True, "build"
    elif REVIEW_REGEX.match(name):
        return True, "review"
    else:
        return False, None


def generate_pipeline_names(
    vcs: str, language: str, framework: str
) -> Tuple[str, str]:
    """
    Generate build and review pipeline names.

    Args:
        vcs: VCS provider (github, gitlab, bitbucket)
        language: Programming language (python, java, javascript, etc.)
        framework: Framework or build tool (fastapi, springboot, npm, etc.)

    Returns:
        Tuple of (build_name, review_name)
    """
    build_name = BUILD_PATTERN.format(
        vcs=vcs.lower(),
        language=language.lower(),
        framework=framework.lower()
    )
    review_name = REVIEW_PATTERN.format(
        vcs=vcs.lower(),
        language=language.lower(),
        framework=framework.lower()
    )

    return build_name, review_name


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    # Validation mode
    if sys.argv[1] == "--validate":
        if len(sys.argv) != 3:
            print("Usage: generate-pipeline.py --validate <pipeline-name>")
            sys.exit(1)

        pipeline_name = sys.argv[2]
        is_valid, pipeline_type = validate_pipeline_name(pipeline_name)

        if is_valid:
            print(f"✓ Valid {pipeline_type} pipeline name: {pipeline_name}")
            sys.exit(0)
        else:
            print(f"✗ Invalid pipeline name: {pipeline_name}", file=sys.stderr)
            print("\nExpected formats:", file=sys.stderr)
            print(
                "  Build:  <vcs>-<language>-<framework>-app-build-default",
                file=sys.stderr
            )
            print(
                "  Review: <vcs>-<language>-<framework>-app-review",
                file=sys.stderr
            )
            sys.exit(1)

    # Generation mode
    if len(sys.argv) != 4:
        print("Usage: generate-pipeline.py <vcs> <language> <framework>")
        sys.exit(1)

    vcs = sys.argv[1]
    language = sys.argv[2]
    framework = sys.argv[3]

    # Validate inputs
    if not validate_vcs(vcs):
        sys.exit(1)
    if not validate_component(language, "language"):
        sys.exit(1)
    if not validate_component(framework, "framework"):
        sys.exit(1)

    # Generate pipeline names
    build_name, review_name = generate_pipeline_names(vcs, language, framework)

    # Output results
    print("Generated pipeline names:")
    print(f"  Build:  {build_name}")
    print(f"  Review: {review_name}")
    print()
    print("Onboarding commands:")
    print(
        f"  ./charts/pipelines-library/scripts/onboarding-component.sh "
        f"--type build-pipeline -n {build_name} --vcs {vcs}"
    )
    print(
        f"  ./charts/pipelines-library/scripts/onboarding-component.sh "
        f"--type review-pipeline -n {review_name} --vcs {vcs}"
    )


if __name__ == "__main__":
    main()
