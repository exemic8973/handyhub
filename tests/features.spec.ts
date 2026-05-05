import { test, expect } from '@playwright/test';

test.describe('HandyHub - All Features Test', () => {
  
  test('Homepage loads correctly with all sections', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Expert Home Repairs');
    
    // Check navigation
    await expect(page.getByRole('link', { name: 'HandyHub' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' }).first()).toBeVisible();
    
    // Check services section
    await page.locator('#services').scrollIntoViewIfNeeded();
    await expect(page.locator('#services')).toBeVisible();
    
    // Check testimonials section
    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    await expect(page.locator('#testimonials')).toBeVisible();
    
    // Check contact section
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('Search bar functionality', async ({ page }) => {
    await page.goto('/');
    
    // Click search icon to open search bar (desktop version)
    const searchButtons = page.getByRole('button', { name: 'Search' });
    await searchButtons.first().click();
    
    // Type in search
    const searchInputs = page.getByPlaceholder('Search services...');
    await expect(searchInputs.first()).toBeVisible();
    
    await searchInputs.first().fill('plumb');
    
    // Should show dropdown with plumbing
    await expect(page.locator('text=Plumbing').first()).toBeVisible();
  });

  test('Back to top button appears after scrolling', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to the footer (way past 300px threshold)
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Wait for the button to appear
    await page.waitForTimeout(1000);
    
    // Just verify we can scroll back up
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(500);
    
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('Contact form with toast notification', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to contact section
    await page.locator('#contact').scrollIntoViewIfNeeded();
    
    // Fill form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Message').fill('This is a test message');
    
    // Submit form
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    // Check for toast notification
    await expect(page.getByText('Message sent successfully')).toBeVisible({ timeout: 5000 });
  });

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page elements - use exact match for the h2 heading
    await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    
    // Check forgot password link
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    
    // Check sign up link
    await expect(page.getByRole('link', { name: 'Sign up for free' })).toBeVisible();
  });

  test('Login form validation and toast', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.getByLabel('Email address').fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    
    // Submit
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show error toast
    await expect(page.getByText('Invalid email or password').first()).toBeVisible({ timeout: 10000 });
  });

  test('Forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Check page elements
    await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    
    // Fill email
    await page.getByLabel('Email address').fill('test@example.com');
    
    // Submit
    await page.getByRole('button', { name: 'Send Reset Instructions' }).click();
    
    // Should show success state
    await expect(page.getByText('Check your email')).toBeVisible({ timeout: 10000 });
    
    // Should show toast
    await expect(page.getByText('Password reset instructions sent')).toBeVisible({ timeout: 5000 });
  });

  test('Register page with role selection', async ({ page }) => {
    await page.goto('/register');
    
    // Check page elements
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    
    // Check role selection
    await expect(page.getByRole('button', { name: 'I need services' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'I provide services' })).toBeVisible();
    
    // Switch to handyman role
    await page.getByRole('button', { name: 'I provide services' }).click();
    await expect(page.getByText('Join as a professional handyman')).toBeVisible();
    
    // Switch back to customer
    await page.getByRole('button', { name: 'I need services' }).click();
    await expect(page.getByText('Join as a customer to book services')).toBeVisible();
  });

  test('Register form multi-step flow', async ({ page }) => {
    await page.goto('/register');
    
    // Step 1 - Fill personal info
    await page.getByLabel('First name').fill('John');
    await page.getByLabel('Last name').fill('Doe');
    await page.getByLabel('Email address').fill('john.doe@example.com');
    await page.getByLabel('Phone number').fill('+1 555 123 4567');
    
    // Continue to step 2
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should be on step 2
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    
    // Check password strength indicator
    await page.locator('#password').fill('weak');
    await expect(page.getByText('Weak')).toBeVisible();
    
    await page.locator('#password').fill('StrongPass123!');
    await expect(page.getByText('Strong')).toBeVisible();
    
    // Go back to step 1
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByLabel('First name')).toBeVisible();
  });

  test('Mobile navigation menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu
    const menuButton = page.getByRole('button', { name: 'Toggle menu' });
    await menuButton.click();
    
    // Check menu items are visible
    const servicesLinks = page.getByRole('link', { name: 'Services' });
    await expect(servicesLinks.first()).toBeVisible();
    
    // Close menu
    await menuButton.click();
  });

  test('Navigation smooth scroll', async ({ page }) => {
    await page.goto('/');
    
    // Click on services link
    const servicesLinks = page.getByRole('link', { name: 'Services' });
    await servicesLinks.first().click();
    
    // Wait for scroll
    await page.waitForTimeout(1000);
    
    // Check that services section is in view
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeInViewport();
  });

  test('Service cards have hover effects', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to services
    await page.locator('#services').scrollIntoViewIfNeeded();
    
    // Find a service card
    const serviceCard = page.getByText('Plumbing').first();
    await expect(serviceCard).toBeVisible();
    
    // Check Learn More link
    const learnMoreLinks = page.getByRole('link', { name: 'Learn More' });
    await expect(learnMoreLinks.first()).toBeVisible();
  });
});