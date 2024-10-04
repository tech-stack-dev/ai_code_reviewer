export const refineIssuesPrompt = (
   issue: string,
   diffAndCombinedFile: string,
 ): string => {
   return `
       # Code Issue Refinement Analysis
       
       ## Task Description 
       Analyze the provided issue within the context of:
       1. The specific code changes (diff)
       2. The complete file state
       3. The broader repository context provided in the uploaded file
   
       CRITICAL: Repository context and established patterns ALWAYS take precedence over general best practices or personal preferences. If the repository shows a clear pattern or architecture decision, that pattern should be respected even if it differs from common recommendations.
       
       ## Evaluation Criteria
       1. Context Precedence
          - Repository patterns and decisions OVERRIDE general best practices
          - Existing architectural decisions MUST be respected
          - Project-specific conventions take priority over generic recommendations
          - Local optimization should align with global patterns
   
       2. Context Validity
          - Does the issue align with the repository's established patterns?
          - Does it respect existing architectural decisions?
          - Is it consistent with similar solutions in the codebase?
          - Does it consider the full context beyond just the changed files?
   
       3. Technical Validity
          - Is the issue based on concrete, measurable factors?
          - Can the issue be verified through code analysis?
          - Does it align with the project's technical constraints?
   
       4. Actionability
          - Can the solution be implemented while maintaining consistency with existing patterns?
          - Is the fix scope clear and contained?
   
       5. Accuracy and Clarity
          - Is the issue correctly identified in the given code changes?
          - If the identified issue is incorrect, is there another valid issue present?
          - Does it accurately reflect an actual problem in the code?
   
       ## Issue Classification Examples
   
       ### Examples of Issues to KEEP:
       [Previous KEEP examples remain unchanged]
   
       ### Examples of Issues to MODIFY:
   
       1. Incorrect Issue Identification:
          Issue: "Function 'calculateTotal' is too complex and should be refactored"
          Context: 'calculateTotal' is a simple function, but 'applyDiscounts' is complex
          Diff: Changes to pricing calculation logic
          MODIFY: "Function 'calculateTotal' is too complex and should be refactored" -> "Function 'applyDiscounts' has high cyclomatic complexity and should be refactored for better maintainability"
   
       2. Misidentified Component:
          Issue: "Authentication logic in UserProfile component needs review"
          Context: Authentication logic is correct, but authorization checks are missing
          Diff: Updates to user profile management
          MODIFY: "Authentication logic in UserProfile component needs review" -> "Add proper authorization checks in UserProfile component to ensure secure access control"
   
       ### Examples of Issues to DISCARD:
       [Previous DISCARD examples remain unchanged]
   
       ## Required Response Format
       Respond with exactly one of:
       - "KEEP: [specific technical reason with actionable details]"
       - "MODIFY: [original incorrectly identified issue] -> [newly identified valid issue]"
       - "DISCARD: [specific technical reason with context explanation]"
   
       IMPORTANT: 
       - Start your response with either KEEP, MODIFY, or DISCARD immediately
       - Use MODIFY only when the original issue is incorrectly identified, but another valid issue exists in the code changes
       - If the original issue is incorrect and no valid issues are found, use DISCARD
       - No introduction or additional context
       - No markdown formatting
       - No greetings or conclusions
       - ALWAYS prioritize repository context over personal or general recommendations
       
       ## Analysis Target
       ISSUE TO ANALYZE: ${issue}
   
       ## Supporting Information
       RELEVANT CODE CHANGES:
       ${diffAndCombinedFile}
       `;
 };