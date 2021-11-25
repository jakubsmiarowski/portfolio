Feature #FeatureLine First visit
  Scenario: Display "main" page
    Given I visit "main" page
    And Title is "Kuba Śmiarowski"
    Then I click the "contact" button
    And Contact form is visible
