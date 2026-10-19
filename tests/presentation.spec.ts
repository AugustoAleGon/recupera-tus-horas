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
  await expect(page.getByRole('link', { name: 'Conecta conmigo' })).toHaveAttribute('href', 'https://github.com/AugustoAleGon');
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
  await page.locator('[data-go="10"]').click();
  await expect(page.locator('.slide.active')).toHaveAttribute('data-slide', '10');
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

test('all slides fit desktop, all images load, notes total five minutes', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const total = await page.locator('[data-slide]').evaluateAll(elements => elements.reduce((sum, el) => sum + Number((el as HTMLElement).dataset.seconds), 0));
  expect(total).toBe(300);
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
