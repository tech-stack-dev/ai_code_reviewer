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
    
         ### Examples of Issues to DISCARD:
   
         1. Pattern Contradiction:
            Issue: "Switch from class components to functional components with hooks"
            Context: Repository consistently uses class components by design
            Diff: New component implementation
            DISCARD: Contradicts established project pattern, despite hooks being modern best practice
   
         2. Architecture Violation:
            Issue: "Move state management to Redux"
            Context: Repository uses custom state management solution documented in architecture.md
            Diff: New feature implementation
            DISCARD: Conflicts with intentional architectural decision
   
         3. Convention Override:
            Issue: "Use async/await instead of Promises"
            Context: Codebase standardizes on Promise chains
            Diff: New async operations
            DISCARD: Violates established convention despite async/await being newer
   
         4. Context-Blind Suggestion:
            Issue: "Extract this logic into a utility function"
            Context: Similar logic intentionally duplicated for performance reasons (documented)
            Diff: New business logic
            DISCARD: Ignores documented technical decision
   
         ### Examples of Issues to KEEP:
   
         1. Pattern Violation:
            Issue: "New component bypasses authentication middleware"
            Context: Repository shows consistent auth pattern in all routes
            Diff: New API route
            KEEP: Violates established security pattern
   
         2. Consistency Break:
            Issue: "Error handling doesn't follow project's error boundary pattern"
            Context: Repository has clear error handling strategy
            Diff: New feature with custom error handling
            KEEP: Breaks established error management pattern
   
         3. Architecture Misalignment:
            Issue: "Direct database access bypasses repository pattern"
            Context: Project strictly uses repository pattern for data access
            Diff: New data access implementation
            KEEP: Violates core architectural pattern
   
         4. Convention Breach:
            Issue: "Missing input validation based on project's validation scheme"
            Context: Repository has consistent validation approach
            Diff: New form handling
            KEEP: Fails to follow established validation pattern

         ### Examples of Issues to MODIFY:
  
         1. Incorrect Issue Identification:
            Issue: "Function 'calculateTotal' is too complex and should be refactored"
            Context: 'calculateTotal' is a simple function, but 'applyDiscounts' is complex
            Diff: Changes to pricing calculation logic
            MODIFY: "Function 'calculateTotal' is too complex and should be refactored" -> "Function 'applyDiscounts' has a logic error inside of the if statement"
   
         2. False Performance Concern:
            Issue: "Replace Array.map with for-loop for better performance"
            Context: The performance difference is negligible in this case, but error handling is missing
            Diff: Data transformation function implementation
            MODIFY: "Replace Array.map with for-loop for better performance" -> "Implement proper error handling in the data transformation function to improve reliability"
   
         3. Incorrect Styling Suggestion:
            Issue: "Use double quotes instead of single quotes for string literals"
            Context: The project's style guide allows both quote types, but there's a potential null reference issue
            Diff: New utility function added
            MODIFY: "Use double quotes instead of single quotes for string literals" -> "Add null checks in the new utility function to prevent potential null reference exceptions"

        ### Additional Notes for MODIFY:
        - Modify does not mean rephrasing the previous issue. If the issue is correct, it should be marked as either KEEP or DISCARD based on the context.
        - Use modify only when the mentioned issue is incorrect (not its description but the pointed out issue is not really the issue) and additional issues need to be considered within the same hunk.
        - If you identify another issue alongside existing ones, present both in the same response format, separated by a new line.

        ## Required Response Format
        Respond with exactly one of:
        - KEEP: [specific technical reason with actionable details]
        - DISCARD: [specific technical reason with context explanation]
        - MODIFY: ### Comment on lines X-Y 
         File: Path to file  
         Start line: X  
         End line: Y  
         Comment: Description of the issue or suggestion.
         
         \`\`\`diff
         - Problematic or original code
         + Suggested correction or improvement
         \`\`\` 
    
         ### Additional Notes for MODIFY response format:
         - Begin with a new issue without referencing the previous one.
         - Do not mention the prior issue in your review.
         - Provide the new issue description directly, without an introductory statement.
         - Ensure the description is clear and actionable.

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
