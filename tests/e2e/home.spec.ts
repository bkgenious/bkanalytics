
import { test, expect } from '@playwright/test';

test('has title and core content', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Portfolio/); // Adjust based on your actual metadata

    // Expect hero section to be visible
    await expect(page.locator('h1')).toBeVisible();

    // Expect projects section to be present
    // Assuming a section with id "projects" or heading text
    // await expect(page.getByText('Featured Projects')).toBeVisible();
});

test('can navigate to a project', async ({ page }) => {
    // Navigate to home
    await page.goto('/');

    // Find a project card link (heuristics based on likely class names or role)
    // This is a "smoke test" - if no projects exist, it might fail or verify empty state.
    // For now, checks if navigation works if a link is present.

    // Check if any link to /projects/ exists
    const projectLink = page.locator('a[href^="/projects/"]').first();

    if (await projectLink.count() > 0) {
        await projectLink.click();
        await expect(page).toHaveURL(/\/projects\/.+/);
    }
});
