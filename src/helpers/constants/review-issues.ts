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
        #### File: authentication.py:
        \`\`\`python
        1: def authenticate_user(username, password):
        2:    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        3:    return db.execute(query)
        4:
        5: def reset_password(token, new_password):
        6:    # No password validation or hashing
        7:    query = f"UPDATE users SET password = '{new_password}' WHERE reset_token = '{token}'"
        8:    return db.execute(query)
        10:
        11: def process_payment(payment_info):
        12:    credit_card = payment_info["credit_card"]
        13:    # Logging sensitive data
        14:    logging.info(f"Processing payment for card: {credit_card}")
        15:    # No encryption for sensitive data
        16:    return db.execute("INSERT INTO payments (card_number) VALUES (%s)", (credit_card,))
        \`\`\`
    
        ### Example response
        File: authentication.py
        Start line: 1
        End line: 3
        Comment: SQL injection risk in authentication. User input is directly interpolated into SQL query. This could allow unauthorized access to all user accounts.
    
        Suggested fix:
        \`\`\`diff
        - query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        - return db.execute(query)
        + return db.execute(
        +     "SELECT * FROM users WHERE username = %s AND password = %s",
        +     (username, password)
        + )
        \`\`\`
    
        ---

        File: authentication.py
        Start line: 5
        End line: 8
        Comment:  Multiple security issues:
        1. Storing plain-text passwords without hashing
        2. SQL injection vulnerability in token validation
        3. Missing password complexity validation
    
        Suggested fix:
        \`\`\`diff
        def reset_password(token, new_password):
        +   if not validate_password_complexity(new_password):
        +       raise ValueError("Password does not meet security requirements")
        +   hashed_password = generate_password_hash(new_password)
        -   query = f"UPDATE users SET password = '{new_password}' WHERE reset_token = '{token}'"
        -   return db.execute(query)
        +   return db.execute(
        +       "UPDATE users SET password = %s WHERE reset_token = %s",
        +       (hashed_password, token)
        +   )
        \`\`\`
    
        ---

        File: authentication.py
        Start line: 10
        End line: 15
        Comment: Exposing sensitive credit card information in logs and storing unencrypted card numbers.

        Suggested fix:
        \`\`\`diff
        def process_payment(payment_info):
            credit_card = payment_info["credit_card"]
        -   logging.info(f"Processing payment for card: {credit_card}")
        +   logging.info(f"Processing payment for card ending in {credit_card[-4:]}")
        -   return db.execute("INSERT INTO payments (card_number) VALUES (%s)", (credit_card,))
        +   encrypted_card = encrypt_sensitive_data(credit_card)
        +   return db.execute(
        +       "INSERT INTO payments (encrypted_card_number) VALUES (%s)",
        +       (encrypted_card,)
        +   )
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
        #### File: user_service.py:
        \`\`\`python
        1: class UserService:
        2:     def get_users(self):
        3:         results = []
        4:         users = db.query("SELECT * FROM users")
        5:         for user in users:
        6:             # N+1 query problem
        7:             posts = db.query(f"SELECT * FROM posts WHERE user_id = {user.id}")
        8:             results.append({**user, "posts": posts})
        9:         return results
        10:
        11:     def create_user(self, data):
        12:         # No type hints or input validation
        13:         db_conn = get_db_connection()
        14:         try:
        15:             if "username" in data:
        16:                 cursor = db_conn.cursor()
        17:                 cursor.execute("INSERT INTO users SET ?", data)
        18:                 return True
        19:         except Exception as e:
        20:             print(f"Error: {e}")
        21:             return False
        22:
        23:     def process_large_dataset(self, items):
        24:         file = open('output.txt', 'w')
        25:         for item in items:
        26:             file.write(str(item))
        27:         return True
        \`\`\`
    
        ### Example response

        File: user_service.py
        Start line: 2
        End line: 9
        Comment:  N+1 query problem in user fetching. Making separate database queries for each user's posts will significantly impact performance as the number of users grows.
       
        Suggested fix:
        \`\`\`diff
        def get_users(self):
        -   results = []
            users = db.query("SELECT * FROM users")
        -   for user in users:
        -       posts = db.query(f"SELECT * FROM posts WHERE user_id = {user.id}")
        -       results.append({**user, "posts": posts})
        -   return results
        +   user_ids = [user.id for user in users]
        +   posts = db.query(
        +       "SELECT * FROM posts WHERE user_id IN %s",
        +       (tuple(user_ids),)
        +   )
        +   posts_by_user = defaultdict(list)
        +   for post in posts:
        +       posts_by_user[post.user_id].append(post)
        +   return [{**user, "posts": posts_by_user[user.id]} for user in users]
        \`\`\`
    
        ---

        File: user_service.py
        Start line: 11
        End line: 21
        Comment: Important issues with resource management and error handling:
        1. Database connection not properly closed (potential resource leak)
        2. Cursor not properly closed
        3. Generic exception handling with print statement
        4. Missing input validation
    
        Suggested fix:
        \`\`\`diff
        - def create_user(self, data):
        + def create_user(self, data: dict) -> bool:
        +     required_fields = {"username", "email", "password"}
        +     if not required_fields.issubset(data.keys()):
        +         raise ValueError(f"Missing required fields: {required_fields - data.keys()}")
        +
        -     db_conn = get_db_connection()
        -     try:
        -         if "username" in data:
        -             cursor = db_conn.cursor()
        -             cursor.execute("INSERT INTO users SET ?", data)
        -             return True
        -     except Exception as e:
        -         print(f"Error: {e}")
        -         return False
        +     with get_db_connection() as db_conn:
        +         with db_conn.cursor() as cursor:
        +             try:
        +                 cursor.execute("INSERT INTO users SET ?", data)
        +                 return True
        +             except DatabaseError as e:
        +                 logger.error(f"Database error creating user: {e}")
        +                 raise
        \`\`\`

        ---
    
        File: user_service.py
        Start line: 23
        End line: 27
        Comment: File handle not properly closed.
    
        Suggested fix:
        \`\`\`diff
        def process_large_dataset(self, items):
        -   file = open('output.txt', 'w')
        -   for item in items:
        -       file.write(str(item))
        -   return True
        +   with open('output.txt', 'w') as file:
        +       for item in items:
        +           file.write(str(item))
        +   return True
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
        #### File: helper.py:
        \`\`\`python
        1: def process(d):
        2:     x = d.get('val')
        3:     if x!=None:
        4:         r = x*2
        5:         return r
        6:     return 0
        7:
        8: def calc_avg(l):
        9:     s = 0
        10:    for i in l:
        11:        s+=i
        12:    return s/len(l)
        13:
        14: def format_output(lst,separator):
        15:    return separator.join([str(i) for i in lst])
        \`\`\`
    
        ### Example response

        File: helper.py
        Start line: 1
        End line: 6
        Comment: Code style and readability improvements needed:
        1. Unclear variable names
        2. Inconsistent spacing around operators
        3. Missing type hints and docstring
        4. Non-idiomatic None comparison
    
        Suggested fix:
        \`\`\`diff
        - def process(d):
        + def process_value(data: dict) -> int:
        +     """
        +     Calculate double the value from input dict if it exists.
        +     
        +     Args:
        +         data: Dictionary containing 'value' key
        +     Returns:
        +         int: Doubled value or 0 if value doesn't exist
        +     """
        -     x = d.get('val')
        -     if x!=None:
        -         r = x*2
        -         return r
        +     value = data.get('value')
        +     if value is not None:
        +         return value * 2
        +     return 0
        \`\`\`
    
        ---

        File: helper.py
        Start line: 8
        End line: 12
        Comment: Minor improvements for variable naming and use of built-in functions:
    
        \`\`\`diff
        - def calc_avg(l):
        + def calculate_average(numbers: List[float]) -> float:
        +     """Calculate the average of a list of numbers."""
        -     s = 0
        -     for i in l:
        -         s+=i
        -     return s/len(l)
        +     if not numbers:
        +         raise ValueError("Cannot calculate average of empty list")
        +     return sum(numbers) / len(numbers)
        \`\`\`

        ---
    
        File: helper.py
        Start line: 14
        End line: 15
        Comment: Function signature could be improved with type hints and default parameter:
    
        \`\`\`diff
        - def format_output(lst,separator):
        + def format_output(items: List[Any], separator: str = ",") -> str:
        +     """Join list items with separator into a single string."""
        -     return separator.join([str(i) for i in lst])
        +     return separator.join(str(item) for item in items)
        \`\`\`
        `,
  },
};
