import { expect, test } from '@playwright/test';

test('15 slides, keyboard navigation, URL history and working contact', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-slide]')).toHaveCount(15);
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '1');
  await expect(page.getByRole('button', { name: 'Diapositiva anterior', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Empecemos' }).click();
  await expect(page).toHaveURL(/#\/2$/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '3');
  await page.goBack();
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '2');
  await page.keyboard.press('End');
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '15');
  await expect(page.getByRole('button', { name: 'Diapositiva siguiente', exact: true })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Ir al post de Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/reels/DerUMk4BeHG/');
  await expect(page.locator('.qr-paper img')).toHaveJSProperty('naturalWidth', 600);
  await page.reload();
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '15');
  await page.goto('/#/99');
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '15');
  expect(errors).toEqual([]);
});

test('index, notes and rehearsal timer', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('o');
  await expect(page.getByRole('dialog', { name: 'Elige dónde continuar.' })).toBeVisible();
  await page.locator('[data-go="9"]').click();
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '9');
  await page.keyboard.press('n');
  await expect(page.locator('#notes')).toBeVisible();
  await expect(page.locator('#note-content')).toContainText('Google Ads');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#notes-title')).toContainText('cuello de botella');
  await page.keyboard.press('Escape');
  await expect(page.locator('#notes')).not.toBeVisible();
  await page.clock.install();
  await page.keyboard.press('t');
  await page.clock.runFor(2500);
  await expect(page.locator('#timer')).toHaveText('00:02');
  await page.keyboard.press('t');
  await page.clock.runFor(2000);
  await expect(page.locator('#timer')).toHaveText('00:02');
  await page.getByRole('button', { name: 'Reiniciar cronómetro' }).click();
  await expect(page.locator('#timer')).toHaveText('00:00');
});

test('all slides fit desktop, all images load, notes total ten minutes', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const total = await page.locator('[data-slide]').evaluateAll(elements => elements.reduce((sum, el) => sum + Number((el as HTMLElement).dataset.seconds), 0));
  expect(total).toBe(600);
  for (let i = 1; i <= 15; i++) {
    await page.goto(`/#/${i}`);
    const active = page.locator('.slide.active');
    await expect(active).toHaveAttribute('data-slide', String(i));
    await active.evaluate(async el => Promise.all([...el.querySelectorAll('img')].map(img => img.decode())));
    const violations = await active.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const footer = el.querySelector('.slide-footer')!.getBoundingClientRect();
      return [...el.querySelectorAll('h1,h2,.body-text,.lines,.aside-line,.byline,.start-button,.qr-block,.cta-description,.contact-name,.result-caption,.scan-result,.invoice-flow,.personal-resolution')].filter(child => {
        const r = child.getBoundingClientRect();
        return r.bottom > footer.top - 4 || r.left < rect.left || r.right > rect.right || r.top < rect.top;
      }).map(child => child.className || child.tagName);
    });
    expect(violations, `Slide ${i} overflow`).toEqual([]);
  }
});

test('mobile stays readable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i = 1; i <= 15; i++) {
    await page.goto(`/#/${i}`);
    await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', String(i));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Slide ${i}`).toBe(true);
  }
});

test('printing includes every slide', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  for (const slide of await page.locator('[data-slide]').all()) await expect(slide).toBeVisible();
  await expect(page.locator('.app-header')).not.toBeVisible();
});

test('private presenter follows every slide and controls the audience window', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/9');
  await page.keyboard.press('n');
  await page.keyboard.press('Escape');
  const popup = page.waitForEvent('popup');
  await page.locator('#presenter-open').click();
  const presenter = await popup;
  presenter.on('pageerror', error => errors.push(error.message));
  await expect(presenter.locator('#counter')).toHaveText('9 / 15');
  await expect(presenter.locator('#note-content')).toContainText('Google Ads');
  await expect(page.locator('#notes')).not.toBeVisible();
  await presenter.locator('#next').click();
  await expect(page).toHaveURL(/#\/10$/);
  await expect(presenter.locator('#notes-title')).toContainText('cuello de botella');
  await page.keyboard.press('ArrowLeft');
  await expect(presenter.locator('#counter')).toHaveText('9 / 15');
  await page.goBack();
  await expect(presenter.locator('#counter')).toHaveText('10 / 15');

  await presenter.keyboard.press('Home');
  await expect(presenter.locator('#previous')).toBeDisabled();
  for (let i = 1; i <= 15; i++) {
    await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', String(i));
    const expectedNote = await page.locator('.slide.active .speaker-note').evaluate(el => (el as HTMLTemplateElement).content.textContent);
    await expect(presenter.locator('#note-content')).toHaveText(expectedNote!);
    await expect(presenter.frameLocator('#preview').locator('.slide.active')).toHaveAttribute('data-slide', String(i));
    await expect(presenter.frameLocator('#preview').locator('.app-footer')).not.toBeVisible();
    if (i < 15) await presenter.locator('#next').click();
  }
  await expect(presenter.locator('#next')).toBeDisabled();
  await expect(presenter.locator('#next-title')).toHaveText('Fin de la presentación');
  await presenter.screenshot({ path: testInfo.outputPath('presenter-desktop.png'), fullPage: true });

  await page.keyboard.press('n');
  await expect(page.locator('#notes')).not.toBeVisible();
  await page.locator('#fullscreen').click();
  await expect(page.locator('.app-header')).not.toBeVisible();
  await expect(page.locator('.app-footer')).not.toBeVisible();
  await expect(page.locator('.slide.active')).toBeVisible();
  await page.keyboard.press('f');

  await presenter.setViewportSize({ width: 390, height: 844 });
  expect(await presenter.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(presenter.locator('#note-content')).toBeVisible();
  await presenter.screenshot({ path: testInfo.outputPath('presenter-mobile.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('presenter reconnects, shares the timer, and can be reopened safely', async ({ page }) => {
  await page.goto('/#/13');
  const popup = page.waitForEvent('popup');
  await page.locator('#presenter-open').click();
  const presenter = await popup;
  await expect(presenter.locator('#counter')).toHaveText('13 / 15');
  await presenter.locator('#timer-toggle').click();
  await expect(page.locator('#timer-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(presenter.locator('#timer')).toHaveText('00:01');
  await presenter.locator('#timer-toggle').click();
  await expect(page.locator('#timer-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(presenter.locator('#timer')).toHaveText(await page.locator('#timer').innerText());
  await presenter.locator('[data-action="reset"]').click();
  await expect(page.locator('#timer')).toHaveText('00:00');
  await expect(presenter.locator('#timer')).toHaveText('00:00');

  await presenter.reload();
  await expect(presenter.locator('#counter')).toHaveText('13 / 15');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/presenter-connected/);
  await presenter.locator('#next').click();
  await expect(page).toHaveURL(/#\/14$/);
  await presenter.close();
  const reopenedPopup = page.waitForEvent('popup');
  await page.keyboard.press('n');
  const reopened = await reopenedPopup;
  await expect(reopened.locator('#counter')).toHaveText('14 / 15');
  await expect(page.locator('#notes')).not.toBeVisible();
  await page.close();
  await expect(reopened.locator('#connection')).toContainText('Sin conexión');
  await expect(reopened.locator('#previous')).toBeDisabled();
});

test('blocked popups explain how to open presenter notes', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { window.open = () => null; });
  await page.locator('#presenter-open').click();
  await expect(page.getByRole('alert')).toContainText('Permite las ventanas emergentes');
});
