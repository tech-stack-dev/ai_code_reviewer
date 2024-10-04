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
      
      ## Evaluation Criteria
      1. Context Validity
         - Does the issue accurately reflect the current code state? Do not only consider the diffs, but also a much broader context
         - Is the issue relevant to the changed code sections? Do not only consider the diffs, but also a much broader context
         - Does the broader repository context support this issue? Do not only consider the diffs, but also a much broader context
  
      2. Technical Validity
         - Is the issue based on concrete, measurable factors?
         - Can the issue be verified through code analysis?
  
      3. Actionability
         - Can the solution be implemented without major architectural changes?
         - Is the fix scope clear and contained?
  
      ## Issue Classification Examples
  
      ### Examples of Issues to DISCARD:
  
      1. Premature Optimization:
         Issue: "The database query should use indexing for better performance"
         Context: Application is in early stages with small dataset
         Diff: Shows basic CRUD operations
         DISCARD: Performance optimization is premature without evidence of performance issues in production
  
      2. Misconception of Existing Implementation:
         Issue: "The password reset token is stored insecurely in plain text"
         Context: Code shows proper hashing in auth_utils.py
         Diff: Changes to password reset flow
         DISCARD: Issue incorrectly assesses existing security measures which are properly implemented
  
      3. Style Over Substance:
         Issue: "Convert all class methods to use arrow functions for consistency"
         Context: Project uses mix of regular and arrow functions based on use case
         Diff: New utility methods added
         DISCARD: Purely stylistic preference without technical merit
  
      4. Missing Broader Context:
         Issue: "Implement caching for this API endpoint"
         Context: Service uses API Gateway with built-in caching
         Diff: New API endpoint implementation
         DISCARD: Caching is already handled at infrastructure level
  
      ### Examples of Issues to KEEP:
  
      1. Security Vulnerability:
         Issue: "User role validation missing in new admin endpoint"
         Context: Repository shows consistent role-based access control
         Diff: New admin API endpoint
         KEEP: Critical security check missing in privileged operation
  
      2. Data Integrity Risk:
         Issue: "Race condition in concurrent order processing"
         Context: High-throughput order system
         Diff: New order processing logic
         KEEP: Specific concurrency issue with clear impact on data consistency
  
      3. Error Handling Gap:
         Issue: "Network timeout handling missing in external API call"
         Context: System integrates with unreliable third-party service
         Diff: New API integration code
         KEEP: Resilience issue with clear failure scenario
  
      4. Breaking Change:
         Issue: "New database schema breaks existing migration path"
         Context: Production system with existing data
         Diff: Database schema changes
         KEEP: Concrete issue affecting system stability and deployment
  
      ## Required Response Format
      Respond with exactly one of:
      - "KEEP: [specific technical reason with actionable details]"
      - "DISCARD: [specific technical reason with context explanation]"
  
      IMPORTANT: 
      - Start your response with either KEEP or DISCARD immediately
      - No introduction or additional context
      - No markdown formatting
      - No greetings or conclusions
      
      ## Analysis Target
      ISSUE TO ANALYZE: ${issue}
  
      ## Supporting Information
      RELEVANT CODE CHANGES:
      ${diffAndCombinedFile}
      `;
};
