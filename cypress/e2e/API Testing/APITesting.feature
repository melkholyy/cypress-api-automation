Feature: Cypress example

  Scenario: Get call response from endpoint "/status"
    Given I get call response from endpoint "/status"
    Then I should see the response status code is 200
    And I should see the response body contains "status" with value "UP"

  Scenario: Get call response from endpoint "/tools"
    Given I get call response from endpoint "/tools"
    Then I should see the response status code is 200
    And I should see the response body contains "id" with value "4643"
    And When "id" has value "6483" then "name" should have value "Single Axle Dump Trailer 2,990 lbs"
    And the response body has the following values:
      | id   | category | inStock | name                               |
      | 6483 | trailers | true    | Single Axle Dump Trailer 2,990 lbs |
      | 9482 | plumbing | true    | Submersible Water Removal Pump     |

  Scenario: Get call response from endpoint "/tools" with query parameter "category" only returns value "trailers"
    Given I get call response from endpoint "/tools" with parameter "category" and value "trailers"
    Then I should see the response status code is 200
    And Each "category" in the response body should have value "trailers"
    And "category" only exists 3 times in the response body

  Scenario: Get call response from endpoint "/tools" with query parameter "category" and "inStock" only returns value "trailers" and "true"
    Given I get call response from endpoint "/tools" with parameter "category" and value "trailers" and parameter "inStock" and value "true"
    Then I should see the response status code is 200
    And Each "category" in the response body should have value "trailers"
    And Each "inStock" in the response body should have value "true"
    And "category" only exists 3 times in the response body

  Scenario: Validate that the API call fails if the value doesn't exist for query parameter "category"
    Given I get call response from endpoint "/tools" with parameter "category" and value "nonexistent"
    Then I should see the response status code is 400
    And Error message in the response body should contain "Invalid value for query parameter 'category'."

  Scenario: Get call response from endpoint "/tools" with path parameter "id" only returns value "6483"
    Given I get call response from endpoint "/tools/6483?category=trailers"
    Then I should see the response status code is 200
    And I should see the response body contains "id" with value "6483"
    And I should see the response body contains "name" with value "Single Axle Dump Trailer 2,990 lbs"
    And I should see the response body contains "category" with value "trailers"

  Scenario: Get call response from endpoint "/tools" with wrong path parameter "id"
    Given I get call response from endpoint "/tools/1234"
    Then I should see the response status code is 404
    And Error message in the response body should contain "No tool with id 1234."

  Scenario: POST call response to create an API client from endpoint "/api-clients" to get access token
    Given POST call response to create an API client from endpoint "/api-clients" to get access token
    Then I should see the response status code is 201
    And I should see the response body contains accessToken
    When I send a POST request to endpoint "/orders" with the access token with body:
      | toolId |
      |   6483 |
    Then I should see the response status code is 201
    And I should see the response body contains "created" with value "true"
    Then get the first out of stock item from the response body and store its "orderId"
    When I send a GET request to endpoint "/orders/{orderId}" with the access token
    Then I should see the response status code is 200
    And I should see the response body contains the order id
    Given send a PATCH request to endpoint '/orders/{orderId}' with the access token with body:
      | customerName |
      | John Doe     |
    Then I should see the response status code is 204
    When I send a GET request to endpoint "/orders/{orderId}" with the access token
    Then I should see the response status code is 200
    And I should see the response body contains "customerName" with value "John Doe"

  Scenario: Get call response from endpoint "/tools"
    Given I get call response from endpoint "/tools" with parameter "available" and value "false"
    Then I should see the response status code is 200
    And Each "inStock" in the response body should have value "false"
    Then get the first out of stock item from the response body and store its 'id'
    Given POST call response to create an API client from endpoint "/api-clients" to get access token
    Then I should see the response status code is 201
    And I should see the response body contains accessToken
    When I send a POST request to endpoint "/orders" with the access token with body:
      | toolId           |
      | outOfStockToolId |
    Then I should see the response status code is 400
    And Error message in the response body should contain "Invalid or missing toolId."

  Scenario: POST call response to create an API client from endpoint "/api-clients" to get access token
    Given POST call response to create an API client from endpoint "/api-clients" to get access token
    Then I should see the response status code is 201
    And I should see the response body contains accessToken
    When I send a POST request to endpoint "/orders" with the access token with body:
      | toolId |
      |   6483 |
    Then I should see the response status code is 201
    And I should see the response body contains "created" with value "true"
    Then get the first out of stock item from the response body and store its "orderId"
    When I send a GET request to endpoint "/orders/{orderId}" with the access token
    Then I should see the response status code is 200
    And I should see the response body contains the order id
    Given send a DELETE request to endpoint '/orders/{orderId}' with the access token with body:
      | customerName |
      | John Doe     |
    Then I should see the response status code is 204
    When I send a GET request to endpoint "/orders/{orderId}" with the access token
    Then I should see the response status code is 404
    And Error message in the response body should contain "No order"
