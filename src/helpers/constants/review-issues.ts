export const reviewIssues = {
  criticalIssues: {
    title: 'Tier 1: Critical Issues',
    points: [
      'Code contains security vulnerabilities (e.g., SQL injection, XSS).',
      'Important functionality is broken or not working as intended.',
      'Code introduces performance bottlenecks (e.g., excessive loops or heavy computations).',
      'Inadequate error handling for critical operations.',
      'Dependencies are outdated or vulnerable (requires immediate upgrade).',
      'Missing required documentation for core functionalities or APIs.',
      'Violation of coding standards that could lead to major issues.',
    ],
    responseExample: `
  ### Example changes
  #### File: \`database.py\`
  
  ### Full file content:
  \`\`\`python
  1: import sqlite3
  2: def get_user(user_id):
  3:     conn = sqlite3.connect('users.db')
  4:     cursor = conn.cursor()
  5:     cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
  6:     user = cursor.fetchone()
  7:     conn.close()
  8:     return user
  \`\`\`
  
  ### Example changes
  \`\`\`diff
  @@ -5,7 +5,7 @@
  -    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
  +    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))  # Fix: Avoid SQL injection by using parameterized queries
   \`\`\`
  
  
  ### Example response
  ### Comment on lines 5-5:
  \`\`\`
  The code is vulnerable to SQL injection. Using parameterized queries fixes this and prevents potential security risks.
  
  Suggested fix:
  \`\`\`diff
  - cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
  + cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
  \`\`\`
  \`\`\`
  
  `,
  },
  importantIssues: {
    title: 'Tier 2: Important Issues',
    points: [
      'Code lacks unit tests or integration tests for significant components (only when it would be really helpful)',
      'Inconsistent naming conventions or unclear variable/method names.',
      'Code duplication across multiple files or modules.',
      'Potential memory leaks due to unclosed resources (e.g., file streams, database connections).',
      'Incorrect usage of asynchronous patterns (e.g., unhandled promises).',
      'Performance issues that can be resolved with optimizations (e.g., complex queries).',
      'Inconsistent use of error messages or lack of user feedback in the UI.',
    ],
    responseExample: `
  ### Example changes
  #### File: \`data_processor.py\`
  
  Full file content:
  \`\`\`python
  1: import csv
  2: def process_file(filename):
  3:     file = open(filename)
  4:     reader = csv.reader(file)
  5:     data = []
  6:     for row in reader:
  7:         data.append(row)
  8:     file.close()
  9:     return data
  \`\`\`
  
  ### Example changes
  \`\`\`diff
  @@ -3,7 +3,7 @@
       file = open(filename)
  +    with open(filename) as file: 
           reader = csv.reader(file)
           data = []
           for row in reader:
  \`\`\`
  
  ### Example response
  ### Comment on lines 3-8:
  The file is not being properly closed if an exception occurs. Using a context manager (\`with\`) ensures the file is always closed, even in case of an error.
  
  Suggested fix:
  \`\`\`diff
  + with open(filename) as file:
  \`\`\`
      `,
  },
  minorImprovements: {
    title: 'Tier 3: Minor Improvements',
    points: [
      'Refactoring suggestions for code clarity and maintainability.',
      'Code style inconsistencies (e.g., spacing, indentation).',
      'Enhancements to documentation (but only when it would be really helpful)',
      'Recommendations for using more modern or efficient language features.',
      'Suggestions to improve UI/UX without altering functionality.',
      'Proposing better variable names for improved readability.',
      'General best practices (e.g., favoring immutability, avoiding global variables).',
    ],
    responseExample: `
  ### Example changes
  #### File: \`math_utils.py\`
  
  Full file content:
  \`\`\`python
  1: def calculate_sum(numbers):
  2:     total = 0
  3:     for num in numbers:
  4:         total += num
  5:     return total
  \`\`\`
  
  ### Example changes
  \`\`\`diff
  @@ -2,5 +2,3 @@
   def calculate_sum(numbers):
  -    total = 0
  -    for num in numbers:
  -        total += num
  -    return total
  +    return sum(numbers)  # Minor improvement: Use built-in sum() for simplicity and readability
   \`\`\`
  
  ### Example response
  ### Comment on lines 2-5:
  Minor improvement: Refactored the \`for\` loop to use the built-in \`sum\` function, which improves readability and is more concise.
  
  Suggested fix:
  \`\`\`
  + return sum(numbers)
  \`\`\`
      `,
  },
};
