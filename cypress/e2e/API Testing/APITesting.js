import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
let accessToken = "";

Given("I get call response from endpoint {string}", (endpoint) => {
  getRequest(endpoint).as("response");
});

Given("I send a GET request to endpoint {string} with the access token", (endpoint) => {
  if (endpoint.includes("{orderId}")) {
    cy.get("@fetchedValue").then((orderId) => {
      endpoint = endpoint.replace("{orderId}", orderId)
      cy.get("@accessToken").then((token) => {
        getRequestWithToken(endpoint, token).as("response");
      });
    })
  }
})

Given("send a PATCH request to endpoint {string} with the access token with body:", (endpoint, table) => {
  table.hashes().forEach((body) => {
    cy.get("@fetchedValue").then((orderId) => {
      endpoint = endpoint.replace("{orderId}", orderId);
      cy.get("@accessToken").then((token) => {
        patchRequestWithToken(endpoint, token, body).as("response");
      });
    });
  })
});

Given("send a DELETE request to endpoint {string} with the access token with body:", (endpoint, table) => {
  cy.get("@fetchedValue").then((orderId) => {
    endpoint = endpoint.replace("{orderId}", orderId);
    cy.get("@accessToken").then((token) => {
      deleteRequestWithToken(endpoint, token).as("response");
    });
  })
});

Given("POST call response to create an API client from endpoint {string} to get access token", (endpoint) => {
  cy.fixture("clientCreation").then((body) => {
    const randomNumber = Math.floor(100 + Math.random() * 900); // Generate a random 3-digit number
    body.clientName = `test${randomNumber}`;
    body.clientEmail = `test${randomNumber}@example.com`;
    cy.wrap(body.clientName).as("clientName");
    createClientRequest(endpoint, body).as("response");
  });
});

Given("I send a POST request to endpoint {string} with the access token with body:", (endpoint, table) => {
  table.hashes().forEach((body) => {
    cy.get("@clientName").then((name) => {
      if (body.toolId === "outOfStockToolId") {
        cy.get("@fetchedValue").then((toolId) => {
          body.toolId = toolId;
          cy.log("Tool ID: " + body.toolId);
        });
      }
      body.customerName = name;
      cy.get("@accessToken").then((token) => {
        accessToken = token;
        cy.log("Access Token: " + accessToken);
        cy.log("Customer Name: " + body.customerName);
        authorizedPostRequest(endpoint, accessToken, body).as("response");
      });

    });
  });
});

Given("I get call response from endpoint {string} with parameter {string} and value {string}", (endpoint, param, value) => {
  const endpointWithParam = `${endpoint}?${param}=${value}`;
  getRequest(endpointWithParam).as("response");
});

Given("I get call response from endpoint {string} with parameter {string} and value {string} and parameter {string} and value {string}", (endpoint, param1, value1, param2, value2) => {
  const endpointWithParam = `${endpoint}?${param1}=${value1}&${param2}=${value2}`;
  getRequest(endpointWithParam).as("response");
});

Then("I should see the response status code is {int}", (statusCode) => {
  cy.get("@response").then((response) => {
    expect(response.status).to.eq(statusCode);
  });
});

Then("get the first out of stock item from the response body and store its {string}", (key) => {
  cy.get("@response").then((response) => {
    cy.wrap(response.body[key]).as("fetchedValue");
  });
});

Then("I should see the response body contains {string} with value {string}", (key, value) => {
  cy.get("@response").then((response) => {
    if (Array.isArray(response.body)) {
      expect(response.body.some((item) => String(item[key]) === String(value))).to.be.true;
      cy.log(JSON.stringify(response.body));
    } else {
      expect(String(response.body[key])).to.eq(String(value));
      cy.log(`The response body contains ${key} with value ${value}`);
    }
  })
});

Then("I should see the response body contains the order id", () => {
  cy.get("@response").then((response) => {
    cy.get("@fetchedValue").then((orderId) => {
      expect(String(response.body.orderId)).to.eq(String(orderId));
    });
  })
});


Then("When {string} has value {string} then {string} should have value {string}", (key1, value1, key2, value2) => {
  cy.get("@response").then((response) => {
    expect(response.body.some((item) => String(item[key1]) === String(value1) && String(item[key2]) === String(value2))).to.be.true;
  });
});

Then("I should see the response body contains {string}", (key) => {
  cy.get("@response").then((response) => {
    let count = 0;

    if (Array.isArray(response.body)) {
      for (let i = 0; i < response.body.length; i++) {
        const item = response.body[i];
        if (item[key] !== undefined) {
          count++;
        }
      }
      expect(count).to.be.gt(0);
    } else {
      expect(response.body[key]).to.exist;
    }
    if (key === "accessToken") {
      cy.wrap(response.body.accessToken).as("accessToken");
      cy.get("@accessToken").then((accessToken) => {
        cy.log("Access Token: " + accessToken);
      });
    }
  });
});

Then("I should see the response body contains accessToken", () => {
  cy.get("@response").then((response) => {
    cy.wrap(response.body.accessToken).as("accessToken");
    cy.log("Access Token: " + accessToken);
  })

});

Then("Each {string} in the response body should have value {string}", (key, value) => {
  cy.get("@response").then((response) => {
    response.body.forEach((item) => {
      expect(String(item[key])).to.eq(String(value));
    });
  });
});

Then("{string} only exists {int} times in the response body", (key, expectedCount) => {
  cy.get("@response").then((response) => {
    let count = 0;
    response.body.forEach((item) => {
      if (String(item[key])) {
        count++;
      }
    });
    expect(response.body.length).to.eq(expectedCount);
    expect(count).to.eq(expectedCount);
  });
});

Then("the response body has the following values:", (table) => {
  cy.get("@response").then((response) => {
    table.hashes().forEach((row) => {
      const matchingItem = response.body.some((item) =>
        Object.keys(row).every((header) => String(item[header]) === String(row[header]))
      );
      expect(matchingItem).to.be.true;
    });
  });
});

Then("Error message in the response body should contain {string}", (expectedMessage) => {
  cy.get("@response").then((response) => {
    expect(response.body.error).to.include(expectedMessage);
  });
});

// Helper function

function getRequest(endpoint) {
  return cy.request({
    method: "GET",
    url: Cypress.config().baseUrl + endpoint,
    failOnStatusCode: false
  });
}

function getRequestWithToken(endpoint, accessToken) {
  return cy.request({
    method: "GET",
    url: Cypress.config().baseUrl + endpoint,
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    failOnStatusCode: false
  });
}

function deleteRequestWithToken(endpoint, accessToken) {
  return cy.request({
    method: "DELETE",
    url: Cypress.config().baseUrl + endpoint,
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    failOnStatusCode: false
  });
}

function patchRequestWithToken(endpoint, accessToken, requestBody) {
  return cy.request({
    method: "PATCH",
    url: Cypress.config().baseUrl + endpoint,
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    body: requestBody,
    failOnStatusCode: false
  });
}

function authorizedPostRequest(endpoint, accessToken, requestBody) {
  return cy.request({
    method: "POST",
    url: Cypress.config().baseUrl + endpoint,
    body: requestBody,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    failOnStatusCode: false
  });
}

function createClientRequest(endpoint, requestBody) {
  return cy.request({
    method: "POST",
    url: Cypress.config().baseUrl + endpoint,
    body: requestBody,
    headers: {
      "Content-Type": "application/json"
    },
    failOnStatusCode: false
  });
}

