/**
 * =====================================================================
 * PrintShop — Phase 2: Frontend Rendering Audit
 * =====================================================================
 *
 * HOW TO USE:
 *   1. Open http://localhost:5173
 *   2. Scroll to the Products section
 *   3. Open DevTools > Console (F12)
 *   4. Paste this entire script and press Enter
 *
 * WHAT IT MEASURES:
 *   - PNG actual content bounding box (full pixel scan)
 *   - PNG transparent padding per side
 *   - PNG occupancy %
 *   - CSS rendering dimensions
 *   - CSS letterboxing (empty H/V space)
 *   - Occupancy at every stage (wrapper, card)
 *   - Root cause isolation per image
 *   - Automatic summary + 10 final questions
 *   - DOM visual badges on each ProductCard
 * =====================================================================
 */

(async () => {

  // ─── 1. FIND PRODUCT IMAGES ──────────────────────────────────────────
  const imgs = Array.from(document.querySelectorAll('img[class*="object-contain"]'));
  if (!imgs.length) {
    console.error('[AUDIT] No images with object-contain found.');
    return;
  }
  console.log('[AUDIT] Found ' + imgs.length + ' product image(s). Analyzing...');

  // ─── 2. PNG CONTENT BOUNDING BOX (full pixel scan) ───────────────────
  async function analyzePNG(img) {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    let data;
    try {
      data = ctx.getImageData(0, 0, W, H).data;
    } catch (e) {
      return { error: 'CORS_ERROR' };
    }

    const ALPHA_THRESHOLD = 10;
    let minX = W, maxX = 0, minY = H, maxY = 0, transparentPixels = 0;
    const totalPixels = W * H;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const a = data[(y * W + x) * 4 + 3];
        if (a < ALPHA_THRESHOLD) {
          transparentPixels++;
        } else {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return { error: 'FULLY_TRANSPARENT', pngSize: { w: W, h: H } };
    }

    const contentW = maxX - minX + 1;
    const contentH = maxY - minY + 1;
    const opaquePixels = totalPixels - transparentPixels;

    return {
      pngSize:            { w: W, h: H },
      contentBBox:        { left: minX, top: minY, right: maxX, bottom: maxY },
      contentSize:        { w: contentW, h: contentH },
      transparentPixels,
      opaquePixels,
      totalPixels,
      pngOccupancyPct:    (opaquePixels / totalPixels * 100).toFixed(1) + '%',
      transparentPct:     (transparentPixels / totalPixels * 100).toFixed(1) + '%',
      emptyCanvasPct:     (transparentPixels / totalPixels * 100).toFixed(1) + '%',
      contentAspectRatio: (contentW / contentH).toFixed(3),
      transparentPadding: {
        left:   minX,
        right:  W - maxX - 1,
        top:    minY,
        bottom: H - maxY - 1,
      },
      hasExcessivePadding:
        minX > W * 0.05 || (W - maxX - 1) > W * 0.05 ||
        minY > H * 0.05 || (H - maxY - 1) > H * 0.05,
    };
  }

  // ─── 3. CSS RENDERING METRICS ─────────────────────────────────────────
  function analyzeCSSRendering(img) {
    const rect      = img.getBoundingClientRect();
    const cs        = getComputedStyle(img);
    const container = img.parentElement;
    const cRect     = container.getBoundingClientRect();
    const card      = img.closest('[class*="rounded-2xl"]');
    const cardRect  = card ? card.getBoundingClientRect() : null;

    const renderedW = rect.width, renderedH = rect.height;
    const naturalW  = img.naturalWidth, naturalH = img.naturalHeight;
    const padT = parseFloat(cs.paddingTop),   padR = parseFloat(cs.paddingRight);
    const padB = parseFloat(cs.paddingBottom),padL = parseFloat(cs.paddingLeft);
    const availW = renderedW - padL - padR;
    const availH = renderedH - padT - padB;
    const scale  = Math.min(availW / naturalW, availH / naturalH);
    const visW   = Math.round(naturalW * scale);
    const visH   = Math.round(naturalH * scale);
    const emptyH = Math.round(availW - visW);
    const emptyV = Math.round(availH - visH);

    return {
      wrapper:               { w: Math.round(cRect.width), h: Math.round(cRect.height) },
      card: cardRect       ? { w: Math.round(cardRect.width), h: Math.round(cardRect.height) } : null,
      rendered:              { w: Math.round(renderedW), h: Math.round(renderedH) },
      availableAfterPadding: { w: Math.round(availW), h: Math.round(availH) },
      visualProduct:         { w: visW, h: visH },
      emptyCSSSpace:         { horizontal: emptyH, vertical: emptyV },
      isLetterboxed:         emptyH > 4 || emptyV > 4,
      objectFit:             cs.objectFit,
      cssPadding:            { top: padT, right: padR, bottom: padB, left: padL },
      transform:             cs.transform !== 'none' ? cs.transform : 'none',
      cssScaleFactor:        parseFloat(scale.toFixed(4)),
      cssReducing:           scale < 0.999,
      cssEnlarging:          scale > 1.001,
      occupancyVsWrapper:    ((visW * visH) / (renderedW * renderedH) * 100).toFixed(1) + '%',
      occupancyVsCard: cardRect
        ? ((visW * visH) / (cardRect.width * cardRect.height) * 100).toFixed(1) + '%'
        : null,
    };
  }

  // ─── 4. ROOT CAUSE ISOLATION ──────────────────────────────────────────
  function isolateRootCause(png, css) {
    const issues = [], stages = [];
    if (png.hasExcessivePadding) {
      issues.push('PNG contains excessive transparent padding.');
      stages.push('Generated PNG');
    }
    if (css.isLetterboxed) {
      const h = css.emptyCSSSpace.horizontal, v = css.emptyCSSSpace.vertical;
      if (h > 20 || v > 20) {
        issues.push('CSS object-contain introduces letterboxing (H:' + h + 'px V:' + v + 'px).');
        stages.push('CSS Layout');
      }
    }
    if (css.cssReducing && css.cssScaleFactor < 0.7) {
      issues.push('CSS significantly reduces image (scale=' + css.cssScaleFactor + ').');
      stages.push('ProductCard Component');
    }
    if (css.cssEnlarging) {
      issues.push('CSS enlarges image beyond natural size (scale=' + css.cssScaleFactor + ').');
      stages.push('ProductCard Component');
    }
    return {
      hasIssues:           issues.length > 0,
      issues,
      firstOccurringStage: stages[0] || 'None detected',
      allStagesWithIssues: stages,
    };
  }

  // ─── 5. PROCESS IMAGES ────────────────────────────────────────────────
  const results = [];
  for (let i = 0; i < Math.min(imgs.length, 6); i++) {
    const img      = imgs[i];
    const filename = img.src.split('/').pop();
    console.log('[AUDIT] Processing ' + (i + 1) + ': ' + filename);
    const png      = await analyzePNG(img);
    const css      = analyzeCSSRendering(img);
    const rootCause = png.error
      ? { hasIssues: true, issues: [png.error], firstOccurringStage: 'Asset Loading', allStagesWithIssues: ['Asset Loading'] }
      : isolateRootCause(png, css);
    results.push({ index: i, filename, png, css, rootCause });
  }

  // ─── 6. AUTOMATIC SUMMARY ─────────────────────────────────────────────
  const ok  = results.filter(r => !r.png.error);
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const pf  = s => parseFloat(s);

  const wOcc    = ok.map(r => pf(r.css.occupancyVsWrapper));
  const cOcc    = ok.filter(r => r.css.occupancyVsCard).map(r => pf(r.css.occupancyVsCard));
  const pOcc    = ok.map(r => pf(r.png.pngOccupancyPct));
  const emH     = ok.map(r => r.css.emptyCSSSpace.horizontal);
  const emV     = ok.map(r => r.css.emptyCSSSpace.vertical);
  const nRed    = ok.filter(r => r.css.cssReducing).length;
  const nEnl    = ok.filter(r => r.css.cssEnlarging).length;
  const nPad    = ok.filter(r => r.png.hasExcessivePadding).length;
  const nLet    = ok.filter(r => r.css.isLetterboxed).length;

  const perImage = results.map(r =>
    '  [' + r.index + '] ' + r.filename + '\n' +
    '      Stage: ' + r.rootCause.firstOccurringStage + '\n' +
    (r.rootCause.issues.length
      ? r.rootCause.issues.map(s => '      -> ' + s).join('\n')
      : '      -> No issues detected')
  ).join('\n');

  const summary =
    '\n==================================================' +
    '\nFrontend Rendering Audit — PrintShop' +
    '\n==================================================' +
    '\nImages Audited:                  ' + results.length +
    '\nSuccessfully analyzed:           ' + ok.length +
    '\nErrors (CORS / not found):       ' + (results.length - ok.length) +
    '\n' +
    '\n-- PNG Analysis --' +
    '\nAverage PNG Occupancy:           ' + avg(pOcc).toFixed(1) + '%' +
    '\nImages With Excessive Padding:   ' + nPad +
    '\n' +
    '\n-- CSS Rendering --' +
    '\nAverage Wrapper Occupancy:       ' + avg(wOcc).toFixed(1) + '%' +
    '\nAverage Card Occupancy:          ' + avg(cOcc).toFixed(1) + '%' +
    '\nAverage Empty Horizontal Space:  ' + avg(emH).toFixed(1) + ' px' +
    '\nAverage Empty Vertical Space:    ' + avg(emV).toFixed(1) + ' px' +
    '\nImages Reduced by CSS:           ' + (nRed > 0 ? 'YES (' + nRed + ')' : 'NO') +
    '\nImages Enlarged by CSS:          ' + (nEnl > 0 ? 'YES (' + nEnl + ')' : 'NO') +
    '\nImages With Letterboxing:        ' + nLet +
    '\n' +
    '\n-- Root Cause Per Image --\n' + perImage +
    '\n' +
    '\n==================================================' +
    '\nFinal Questions' +
    '\n==================================================' +
    '\n1.  Source asset inconsistent?         ' + (nPad > 0 ? 'POSSIBLE' : 'NO EVIDENCE') +
    '\n2.  AutoCrop detects product?          See report.json > stage4 > contentBox' +
    '\n3.  Normalize correct dimensions?      See report.json > stage5 (target 85%)' +
    '\n4.  PNG has excessive transp. padding? ' + (nPad > 0 ? 'YES (' + nPad + ')' : 'NO') +
    '\n5.  Vite loads correct asset?          Check filenames match product data' +
    '\n6.  React receives correct image?      Infer from filename match' +
    '\n7.  ProductCard preserves dimensions?  ' + (nRed > 0 ? 'NO — CSS reduces image' : 'YES') +
    '\n8.  CSS introduces scaling?            ' + (nRed > 0 ? 'YES' : 'NO') +
    '\n9.  object-contain causes letterbox?   ' + (nLet > 0 ? 'YES (' + nLet + ')' : 'NO') +
    '\n10. First discrepancy stage:           ' + (results[0]?.rootCause?.firstOccurringStage ?? 'Unknown') +
    '\n==================================================\n';

  console.log(summary);
  console.log('\n[AUDIT] Full JSON:');
  console.log(JSON.stringify(results, null, 2));

  // ─── 7. VISUAL BADGES ON EACH CARD ───────────────────────────────────
  imgs.slice(0, 6).forEach((img, i) => {
    const r = results[i];
    if (!r) return;
    const card = img.closest('[class*="rounded-2xl"]');
    if (!card || card.querySelector('.__audit_badge')) return;
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

    const b = document.createElement('div');
    b.className = '__audit_badge';
    b.style.cssText = [
      'position:absolute', 'bottom:4px', 'left:4px',
      'background:rgba(0,0,0,0.80)', 'color:#fff',
      'font:9px/1.5 monospace', 'padding:4px 6px',
      'border-radius:4px', 'z-index:9999',
      'pointer-events:none', 'max-width:190px',
    ].join(';');

    const ok2  = !r.png.error;
    const pOcc = ok2 ? r.png.pngOccupancyPct : 'ERR';
    const cSz  = ok2 ? (r.png.contentSize.w + 'x' + r.png.contentSize.h) : 'ERR';
    const pSz  = ok2 ? (r.png.pngSize.w + 'x' + r.png.pngSize.h) : r.png.pngSize ? (r.png.pngSize.w + 'x' + r.png.pngSize.h) : '?';
    const flag = r.rootCause.hasIssues ? ('! ' + r.rootCause.firstOccurringStage) : 'OK';

    b.innerHTML =
      'PNG: '    + pSz                          + '<br>' +
      'Content: '+ cSz                          + '<br>' +
      'PNG occ: '+ pOcc                         + '<br>' +
      'Wrap occ:'+ r.css.occupancyVsWrapper     + '<br>' +
      'Card occ:'+ (r.css.occupancyVsCard||'?') + '<br>' +
      'Scale: '  + r.css.cssScaleFactor         + '<br>' +
      'EmH/V: '  + r.css.emptyCSSSpace.horizontal + '/' + r.css.emptyCSSSpace.vertical + 'px<br>' +
      flag;
    card.appendChild(b);
  });

  console.log('[AUDIT] Visual badges drawn on ProductCards.');
  console.log('[AUDIT] Done. Save the JSON to audit-out/frontend-report.json');

  return results;
})();
