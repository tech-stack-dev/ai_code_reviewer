export const reviewConfig = {
    criticalIssues: {
        title: "Tier 1: Critical Issues",
        points: [
            "Logic Errors",
            "Flaws in the code that cause incorrect behavior or results. These errors disrupt the intended functionality and must be corrected to ensure proper operation.",
            "Security Vulnerabilities",
            "Weaknesses that expose the system to attacks or unauthorized access. These issues can lead to data breaches or exploitation, requiring immediate attention.",
            "Critical Performance Problems",
            "Significant inefficiencies that slow down execution or consume excessive resources. These issues affect user experience and system scalability.",
            "Data Integrity Issues",
            "Risks of data corruption or inconsistency, particularly in transactional systems. Such issues can lead to incorrect data handling and severe operational impacts.",
            "Concurrency Problems (Race Conditions, Deadlocks)",
            "Issues arising from simultaneous operations that can lead to unpredictable behavior or system freezes. These problems occur when multiple processes interfere with each other.",
            "Severe Compatibility Issues",
            "Problems that prevent the code from working with external systems or libraries. These issues can arise from deprecated features or version mismatches, leading to failures in functionality."
          ],
    },
    importantIssues: {
      title: "Tier 2: Important Issues",
      points: [
        "Non-Critical Performance Optimizations",
        "Opportunities to improve efficiency that do not critically affect performance but can enhance overall responsiveness and resource usage.",
        "Error Handling Improvements",
        "Enhancements to how the code manages exceptions and failures, ensuring more graceful degradation and better user experience during errors.",
        "Code Duplication",
        "Instances where similar code is repeated, leading to increased maintenance efforts and potential inconsistencies. Refactoring can improve readability and maintainability.",
        "Potential Bugs or Edge Cases",
        "Situations where the code may not behave as expected under specific conditions or inputs, which could lead to unforeseen errors.",
        "Moderate Compatibility Concerns",
        "Issues that may cause minor disruptions when interacting with external systems or libraries, often related to versioning or deprecated methods.",
        "Resource Management Issues",
        "Problems related to improper allocation or release of resources (e.g., file handles, database connections), which can lead to performance degradation over time."
      ],
    },
    minorImprovements: {
      title: "Tier 3: Minor Improvements",
      points: [
        "Code Style and Formatting",
        "Enhancements to ensure consistent adherence to coding standards, improving readability and maintainability of the code.",
        "Documentation Improvements",
        "Adding or refining comments and documentation to clarify code intent and usage, making it easier for future developers to understand.",
        "Naming Conventions",
        "Suggestions for improving variable, function, or class names to better reflect their purpose and enhance code clarity.",
        "Refactoring Opportunities",
        "Identifying areas where code can be simplified or reorganized to improve maintainability and reduce complexity.",
        "Minor Performance Tweaks",
        "Small adjustments that can lead to improved efficiency without addressing critical performance issues.",
        "Unused Code or Imports",
        "Removal of code segments or imports that are no longer needed, streamlining the codebase and reducing clutter."
      ]
    },
  };
  