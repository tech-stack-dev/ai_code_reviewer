export const refineIssuesPrompt = (
  issue: string,
  diffAndCombinedFile: string,
): string => {
  return `
    # Code Issue Refinement Analysis
    
    ## Task Description 

    You will review the code changes provided (in diff format) and the issue we found in this diff and your task is to determine if it is valid and actionable:   

    ## Evaluation Criteria

    Evaluate this issue against these criteria:
    1. Objectivity: Is the issue based on concrete, measurable factors rather than personal preference?
    2. Actionability: Can specific actions be taken to address this issue?
    3. Clarity: Is the issue clearly defined and unambiguous?

    ## Issue Classification Guidelines

    ### Examples of subjective/non-actionable issues that should be DISCARDED:
    1. Comment on lines 0-29 (new file)
        The CarReview class could benefit from a comment explaining the purpose of the class and its attributes. This will improve maintainability and clarity for future developers.

        +class CarReview:
        +    """
        +    Represents a review for a car in the rental system.
        +
        +    Attributes:
        +        id (str): Unique identifier for the review.
        +        comment (str): The review comment provided by the user.
        +        rating (int): The rating given to the car, defaults to 1.
        +        created_at (datetime): Timestamp when the review was created.
        +        updated_at (datetime): Timestamp when the review was last updated.
        +    """

    2. Comment on lines 6-6
        Lack of a newline at the end of the forgot_password_dto.py file may lead to issues with version control diffs and tool compatibility. Ensure to include a newline to adhere to consistent file formatting.

        +

    ### Examples of objective/actionable issues that should be KEPT:
    1. Comment on lines 25-29
        The constructor in CarsController now includes a new service, CarReviewsService, but there is no indication of how this service is initialized or its dependencies. Ensure that all dependencies are properly injected and managed to avoid runtime errors.

        -    def __init__(self, cars_service: CarsService):
        +    def __init__(self, cars_service: CarsService, reviews_service: CarReviewsService):

    2. Comment on lines 88-92
        The new endpoint for retrieving car reviews lacks validation for the car_id parameter. Implement validation to ensure that the car_id is in the expected format (e.g., UUID) to prevent potential issues during execution.

        +    def get_car_reviews(self, car_id: str):
        +        return self.reviews_service.get_reviews_for_car(car_id)

    3. In the CarReview class, there is no indication of a relationship with the User class. If reviews are associated with users, consider adding a foreign key reference to the User class to maintain data integrity and enforce relationships.

        +    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')


    ## Required Response Format
    Respond with one of:
    - "KEEP: [specific technical justification]"
    - "DISCARD: [specific reason for rejection]"
    
    ## Analysis Target
    ISSUE TO ANALYZE: ${issue}

    ## Supporting Information
    RELEVANT CODE CHANGES:
    ${diffAndCombinedFile}
    `;
};
