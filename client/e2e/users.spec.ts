import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("should navigate to the users page", async ({ page }) => {
  await page.goto("/users");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Users");

  const usersList = page.getByRole("list");
  await expect(usersList).toBeVisible();

  const usersListItems = usersList.locator("li");
  await expect(usersListItems).toHaveCount(10);

  const userLinks = usersList.locator("a");
  await expect(userLinks).toHaveCount(10);
  await expect(userLinks.nth(0)).toHaveText("Leanne Graham");

  await userLinks.nth(0).click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "User: Leanne Graham"
  );

  await page.goBack();
  await expect(page).toHaveURL(/\/users/);

  await userLinks.nth(1).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ervin Howell"
  );
});

test("should navigate to the new user page", async ({ page }) => {
  await page.goto("/users");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Users");

  await page.getByRole("link", { name: "New User" }).click();

  await expect(page).toHaveURL(/\/users\/new/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "New User"
  );
});

test("should create a new user", async ({ page }) => {
  await page.goto("/users/new");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "New User"
  );

  const newUser = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    website: faker.internet.url(),
  };

  await page.getByRole("textbox", { name: "Name" }).fill(newUser.name);
  await page.getByRole("textbox", { name: "email" }).fill(newUser.email);
  await page.getByRole("textbox", { name: "phone" }).fill(newUser.phone);
  await page.getByRole("textbox", { name: "website" }).fill(newUser.website);

  await page.getByRole("button", { name: "Create User" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    `User: ${newUser.name}`
  );
});

test("should edit a user", async ({ page }) => {
  await page.goto("/users/new");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "New User"
  );

  const newUser = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    website: faker.internet.url(),
  };

  await page.getByRole("textbox", { name: "Name" }).fill(newUser.name);
  await page.getByRole("textbox", { name: "email" }).fill(newUser.email);
  await page.getByRole("textbox", { name: "phone" }).fill(newUser.phone);
  await page.getByRole("textbox", { name: "website" }).fill(newUser.website);

  await page.getByRole("button", { name: "Create User" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    `User: ${newUser.name}`
  );

  const url = page.url();
  const match = url.match(/\/users\/([^\/]+)/);
  const userId = match?.[1];

  if (!userId) {
    throw new Error("User ID not found");
  }

  await page.goto(`/users/${userId}/edit`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Update User"
  );
  await page.getByRole("textbox", { name: "Name" }).fill("Updated Name");
  await page.getByRole("button", { name: "Update User" }).click();

  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(page).toHaveURL(`/users/${userId}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    `User: Updated Name`
  );
});

test("should delete a user", async ({ page }) => {
  await page.goto("/users/");

  const usersList = page.getByRole("list");
  await expect(usersList).toBeVisible();

  const userLinks = usersList.locator("a");
  await expect(userLinks).toHaveCount(10);
  const userName = await userLinks.nth(9).textContent();

  if (!userName) {
    throw new Error("User name not found");
  }

  const deleteButton = usersList.locator("button");
  await expect(deleteButton).toHaveCount(10);
  await expect(deleteButton.nth(9)).toHaveText("Delete");
  await deleteButton.nth(9).click();
  await expect(deleteButton.nth(9)).not.toHaveText(userName);
});
