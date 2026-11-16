/*
MIT License

Copyright (c) 2026 Jairaj Munirathnam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Local adaptation: Progress, exclusions and fresh-search lifecycle.
*/
/*!
 * Amazon Now Deals Explorer
 * https://github.com/jairaj26/amazon-now-deals
 *
 * Copyright (c) 2026 Jairaj Munirathnam
 * Released under the MIT License
 * https://opensource.org/licenses/MIT
 *
 * Features:
 * - Global Deals Slicer: Uses server-side p_36 price brackets & discount refiners (/s?i=amazontez)
 * - Sidebar Controls: 50%, 60%, 70% off with clean price tiers (Under ₹50, ₹50-₹100, etc.)
 * - Keyword Search: Full pagination with instant deal capture
 * - Category Explorer: Multi-subcategory concurrent worker scanning
 * - Live Results Grid: Dynamic filtering by brand, category, search, and sorting
 */

(function () {
if(!(location.hostname==="amazon.in"||location.hostname.endsWith('.'+"amazon.in"))){alert('Open Amazon Now and select your delivery address first.');return;}
if(document.getElementById('quick-deal-scout-v4-5')){document.getElementById('quick-deal-scout-v4-5').shadowRoot.getElementById('panel').hidden=false;return;}
if(document.getElementById('quick-deal-scout-v4-4')||document.getElementById('quick-deal-scout-v4-3')||document.getElementById('quick-deal-scout-v4-2')||document.getElementById('quick-deal-scout-v4-1')||document.getElementById('quick-deal-scout-v4')||document.getElementById('quick-deal-scout-v3')||document.getElementById('quick-deal-scout-v2')){alert('Reload this shopping tab once before running Scout v4.5. Previous results stay open.');return;}

  'use strict';

  // Helper: Sleep / delay for rate limiting
  function esc(s) {
    return (s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parsePrice(str) {
    if (!str) return null;
    var m = String(str).match(/\d+(?:,\d+)*(?:\.\d+)?/);
    if (!m) return null;
    var val = parseFloat(m[0].replace(/,/g, ''));
    return isNaN(val) ? null : val;
  }

  function createLoadingTab(title) {
    var tab = window.open('', '_blank');
    if (tab) {
      try {
        tab.document.open();
        var loadingHtml = [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          '  <title>' + esc(title || 'Scanning Deals...') + '</title>',
          '  <meta charset="utf-8">',
          '  <meta name="viewport" content="width=device-width, initial-scale=1">',
          '  <style>',
          '    * { box-sizing: border-box; margin: 0; padding: 0; }',
          '    body {',
          '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
          '      display: flex;',
          '      align-items: center;',
          '      justify-content: center;',
          '      min-height: 100vh;',
          '      background: #f8fafc;',
          '      color: #0f172a;',
          '      padding: 20px;',
          '    }',
          '    .card {',
          '      text-align: center;',
          '      padding: 36px 32px;',
          '      background: #ffffff;',
          '      border: 1px solid #e2e8f0;',
          '      border-radius: 16px;',
          '      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.02);',
          '      width: 420px;',
          '      max-width: 100%;',
          '    }',
          '    .spinner {',
          '      width: 42px;',
          '      height: 42px;',
          '      border: 3.5px solid #e2e8f0;',
          '      border-top-color: #058552;',
          '      border-radius: 50%;',
          '      animation: spin 0.8s linear infinite;',
          '      margin: 0 auto 18px;',
          '    }',
          '    @keyframes spin { to { transform: rotate(360deg); } }',
          '    .title {',
          '      font-size: 16px;',
          '      font-weight: 700;',
          '      color: #0f172a;',
          '      margin-bottom: 6px;',
          '    }',
          '    .track {',
          '      width: 100%;',
          '      height: 8px;',
          '      background: #f1f5f9;',
          '      border-radius: 9999px;',
          '      overflow: hidden;',
          '      margin: 18px 0 12px;',
          '      border: 1px solid #e2e8f0;',
          '    }',
          '    .bar {',
          '      width: 8%;',
          '      height: 100%;',
          '      background: linear-gradient(90deg, #058552, #10b981);',
          '      border-radius: 9999px;',
          '      transition: width 0.3s ease;',
          '    }',
          '    .status {',
          '      font-size: 13px;',
          '      font-weight: 600;',
          '      color: #334155;',
          '      margin-bottom: 4px;',
          '    }',
          '    .sub {',
          '      font-size: 12px;',
          '      color: #64748b;',
          '    }',
          '  </style>',
          '</head>',
          '<body>',
          '  <div class="card">',
          '    <div class="spinner"></div>',
          '    <div class="title" id="__aznowTitle">' + esc(title || 'Scanning Amazon Now Deals...') + '</div>',
          '    <div class="track"><div class="bar" id="__aznowProgressBar"></div></div>',
          '    <div class="status" id="__aznowProgressText">Initializing scanner...</div>',
          '    <div class="sub" id="__aznowProgressSub">Please keep this tab open</div>',
          '  </div>',
          '</body>',
          '</html>'
        ].join('\n');
        tab.document.write(loadingHtml);
        tab.document.close();
      } catch (e) {}
    }
    return tab;
  }

  function updateLoadingProgress(tab, pct, statusText, subText) {
    if (!tab || tab.closed) return;
    try {
      var d = tab.document;
      if (!d) return;
      var bar = d.getElementById('__aznowProgressBar');
      if (bar) bar.style.width = Math.max(5, Math.min(100, pct)) + '%';
      var txt = d.getElementById('__aznowProgressText');
      if (txt && statusText) txt.textContent = statusText;
      var sub = d.getElementById('__aznowProgressSub');
      if (sub && subText) sub.textContent = subText;
    } catch (e) {}
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Remove any previous instance of the FAB
  if (window.__aznowFab) {
    window.__aznowFab.remove();
  }

  // Dynamic Brand ID detection (no hardcoded fallback unless user is outside Tez)
  function detectBrandId() {
    // Re-detect the selected session instead of reusing a store cache.

    var sp = new URLSearchParams(location.search);
    var bId = sp.get('qcbrand') || sp.get('brandId') || sp.get('almBrandId');
    if (bId) return bId;

    var brandLink = document.querySelector('a[href*="brandId="], a[href*="qcbrand="], a[href*="almBrandId="]');
    if (brandLink) {
      var m = brandLink.href.match(/(?:brandId|qcbrand|almBrandId)=([^&]+)/);
      if (m && m[1]) return m[1];
    }

    var stateScripts = document.querySelectorAll('script[type="a-state"]');
    for (var i = 0; i < stateScripts.length; i++) {
      try {
        var txt = stateScripts[i].textContent || '';
        if (txt.indexOf('almBrandId') !== -1) {
          var parsed = JSON.parse(txt);
          if (parsed && parsed.almBrandId) return parsed.almBrandId;
        }
      } catch (e) {}
    }

    var htmlMatch = document.documentElement.innerHTML.match(/almBrandId['"&:=\s]+([A-Za-z0-9_-]{8,14})/);
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1];

    return null;
  }

  var brandId = detectBrandId();
  if (brandId) {
    sessionStorage.setItem('__aznowBrandId', brandId);
  }

  function ensureBrandId() {
    if (!brandId) {
      brandId = detectBrandId() || prompt('Please enter your Amazon Now Brand ID (e.g. qqfsWw9RkO):');
      if (brandId) sessionStorage.setItem('__aznowBrandId', brandId);
    }
    return brandId;
  }

  // Auto-detect current search keyword from URL or input
  var initialKeyword = '';
  try {
    var sp = new URLSearchParams(location.search);
    initialKeyword = sp.get('searchKeyword') || sp.get('keyword') || sp.get('k') || '';
    if (!initialKeyword) {
      var domSearch = document.querySelector('input[type="search"], input[name="field-keywords"], input[name="k"]');
      if (domSearch && domSearch.value) {
        initialKeyword = domSearch.value.trim();
      }
    }
  } catch (e) {}

  // Amazon India Discount Refinement Node Map (rnid: 2665398031)
  var discountPillsData = [
    { pct: 50, node: '2665401031', label: '50%' },
    { pct: 60, node: '27060456031', label: '60%' },
    { pct: 70, node: '27060457031', label: '70%' }
  ];

  var selectedMinDiscount = 70;
  var selectedDiscountNode = '27060457031';
  var TEZ_SRS_NODE = '100147972031';

  // Mapping of category nodes requiring merch endpoint vs category endpoint
  var merchMap = {
    216450600031: 1
  };

  // Structured Categories & Subcategories
  var categoriesData = [
    {
      icon: '🌾',
      name: 'Grocery & Staples',
      subs: [
        ['Atta & Flours', '204870009031'],
        ['Rice & Grains', '204870014031'],
        ['Dals & Pulses', '204870007031'],
        ['Chana & Whole Pulses', '204870004031'],
        ['Cooking Oils & Ghee', '204870005031'],
        ['Olive & Premium Oils', '204870010031'],
        ['Spices & Masalas', '204870013031'],
        ['Salt & Sugar', '204870008031'],
        ['Poha & Daliya', '204870012031'],
        ['Soya Chunks', '204870016031'],
        ['Instant Noodles & Pasta', '219564344031']
      ]
    },
    {
      icon: '🥛',
      name: 'Dairy, Bread & Eggs',
      subs: [
        ['Fresh Milk', '204870018031'],
        ['Bread & Bakery', '204870003031'],
        ['Curd & Yogurt', '204870006031'],
        ['Paneer & Fresh Dairy', '204870011031'],
        ['Cheese & Butter', '204870015031'],
        ['Fresh Cream', '204870019031'],
        ['Dairy Whitener & Powder', '204924567031'],
        ['Plant & Coconut Milk', '204870001031']
      ]
    },
    {
      icon: '🍿',
      name: 'Snacks, Sweets & Treats',
      subs: [
        ['Chocolates', '204924526031'],
        ['Premium Chocolates', '204924531031'],
        ['Chips & Crisps', '204924530031'],
        ['Indian Namkeen', '215540425031'],
        ['Bhujia & Sev', '204924562031'],
        ['Wafers & Biscuits', '204924537031'],
        ['Kurkure & Extruded', '204924550031'],
        ['Popcorn', '204924539031'],
        ['Nachos & Mad Angles', '204924540031'],
        ['Sweets & Mithai', '204924552031'],
        ['Chikki & Peanut Treats', '204924571031'],
        ['Roasted Makhana', '204924555031'],
        ['Candies & Marshmallows', '204924572031'],
        ['Cakes & Brownies', '204924573031'],
        ['Chewing Gums & Mints', '204924561031'],
        ['Dry Fruits & Nuts', '204924525031'],
        ['Almonds & Cashews (Raw)', '204924569031']
      ]
    },
    {
      icon: '🥤',
      name: 'Beverages & Drinks',
      subs: [
        ['Cold Drinks & Sodas', '204924556031'],
        ['Tea (Leaf & Bags)', '204924559031'],
        ['Coffee (Instant & Filter)', '204924558031'],
        ['Fruit Juices & Nectars', '204924568031'],
        ['Milkshakes & Flavored Milk', '204870017031'],
        ['Lassi & Buttermilk', '204924557031'],
        ['Club Soda & Mixes', '204924563031'],
        ['Electrolytes & Energy Drinks', '205015903031']
      ]
    },
    {
      icon: '🍦',
      name: 'Ice Creams & Frozen',
      subs: [
        ['Gourmet Ice Cream Tubs', '216450650031'],
        ['Ice Cream Cones & Cornettos', '216450641031'],
        ['Ice Cream Sticks & Bars', '216450655031'],
        ['Ice Cubes & Party Ice', '216450649031'],
        ['Ice Cream Store', '216450600031']
      ]
    },
    {
      icon: '🧴',
      name: 'Personal Care & Beauty',
      subs: [
        ['Facial Cleansers & Face Wash', '204992615031'],
        ['Sunscreens (SPF)', '204992651031'],
        ['Face Serums & Treatments', '204992652031'],
        ['Face Creams & Moisturizers', '204992632031'],
        ['Bathing Soaps & Bars', '204992631031'],
        ['Body Wash & Shower Gel', '204992628031'],
        ['Body Lotions', '204992627031'],
        ['Hair Care & Shampoos', '204992645031'],
        ['Hair Growth Serums', '205015907031'],
        ['Men Grooming & Shaving', '204992619031'],
        ['Feminine Hygiene', '204992654031'],
        ['Makeup & Lipsticks', '204992616031']
      ]
    },
    {
      icon: '🪥',
      name: 'Oral Care & Health',
      subs: [
        ['Toothpaste', '205015906031'],
        ['Toothbrushes', '205015905031'],
        ['Mouthwash', '205015911031'],
        ['Teeth Whitening & Floss', '205015902031'],
        ['Whey & Plant Protein', '205015895031'],
        ['Nutrition Drinks (Ensure)', '205015896031'],
        ['Creatine Monohydrate', '205015912031'],
        ['Multivitamins & Supplements', '205015904031'],
        ['Condoms & Sexual Wellness', '205015909031'],
        ['Lubricants', '205015908031']
      ]
    },
    {
      icon: '🧹',
      name: 'Home Care & Cleaning',
      subs: [
        ['Liquid Detergent (Matic)', '204952379031'],
        ['Detergent Powders', '204952381031'],
        ['Detergent Bars', '204952380031'],
        ['Detergent Pods & Capsules', '204952375031'],
        ['Fabric Conditioners', '204952386031'],
        ['Fabric Whiteners (Vanish)', '204952385031'],
        ['Dishwash Gels & Bars', '204924564031'],
        ['Dishwasher Tablets & Salts', '204924565031'],
        ['Floor Cleaners (Lizol)', '204952368031'],
        ['Toilet Cleaners (Harpic)', '204952388031'],
        ['Bathroom Cleaners', '204952387031'],
        ['Glass & Machine Cleaners', '204952373031'],
        ['Antiseptic Liquids (Dettol)', '204952378031'],
        ['Puja Needs & Agarbatti', '204952383031'],
        ['Dog Food', '204952372031'],
        ['Cat Food', '204952374031']
      ]
    },
    {
      icon: '🍳',
      name: 'Kitchen & Home',
      subs: [
        ['Pressure Cookers', '206264740031'],
        ['Storage Containers', '206264741031'],
        ['Lunch Boxes & Tiffins', '206264742031'],
        ['Insulated Bottles & Flasks', '206264743031'],
        ['Fast Chargers & Cables', '205015892031'],
        ['Cloth Stands & Hangers', '204952370031']
      ]
    },
    {
      icon: '🥦',
      name: 'Fresh Produce & Meat',
      subs: [
        ['Fresh Vegetables', '218833871031'],
        ['Fresh Fruits', '218833884031'],
        ['Meat & Seafood', '218876203031']
      ]
    },
    {
      icon: '👶',
      name: 'Baby Care',
      subs: [
        ['Diapers & Baby Care', '211421666031']
      ]
    },
    {
      icon: '🌿',
      name: 'Paan Corner',
      subs: [
        ['Rolling Papers & Lighters', '219564338031']
      ]
    }
  ];

  // URL builders
  function buildGlobalSearchUrl(discNodeId, page, priceFacet, sortMode) {
    var rh = 'n%3A' + TEZ_SRS_NODE + '%2Cp_n_pct-off-with-tax%3A' + discNodeId;
    if (priceFacet) {
      rh += '%2Cp_36%3A' + priceFacet;
    }
    var sParam = sortMode || 'pct-off-with-tax';
    var almParam = brandId ? '&almBrandId=' + encodeURIComponent(brandId) : '';
    return (
      'https://www.amazon.in/s?i=amazontez&srs=' +
      TEZ_SRS_NODE +
      '&bbn=' +
      TEZ_SRS_NODE +
      '&rh=' +
      rh +
      '&s=' +
      sParam +
      almParam +
      '&dc&page=' +
      page
    );
  }

  function buildKeywordSearchUrl(keyword, discNodeId, page, sortMode) {
    var sParam = sortMode || 'pct-off-with-tax';
    var almParam = brandId ? '&almBrandId=' + encodeURIComponent(brandId) : '';
    return (
      'https://www.amazon.in/s?i=amazontez&srs=' +
      TEZ_SRS_NODE +
      '&bbn=' +
      TEZ_SRS_NODE +
      '&k=' +
      encodeURIComponent(keyword) +
      '&rh=n%3A' +
      TEZ_SRS_NODE +
      '%2Cp_n_pct-off-with-tax%3A' +
      discNodeId +
      '&s=' +
      sParam +
      almParam +
      '&dc&page=' +
      page
    );
  }

  function buildKeywordRawSearchUrl(keyword, page, sortMode) {
    var sParam = sortMode || 'relevanceblender';
    var almParam = brandId ? '&almBrandId=' + encodeURIComponent(brandId) : '';
    return (
      'https://www.amazon.in/s?i=amazontez&srs=' +
      TEZ_SRS_NODE +
      '&bbn=' +
      TEZ_SRS_NODE +
      '&k=' +
      encodeURIComponent(keyword) +
      '&rh=n%3A' +
      TEZ_SRS_NODE +
      '&s=' +
      sParam +
      almParam +
      '&dc&page=' +
      page
    );
  }

  function buildCategoryUrl(nodeId, offset) {
    var endpoint = merchMap[nodeId] ? 'merch' : 'category';
    return (
      'https://www.amazon.in/tez/browse/' +
      endpoint +
      '?nodeId=' +
      nodeId +
      '&brandId=' +
      brandId +
      '&offset=' +
      offset
    );
  }

  // Smart category inference based on title and dark-store metadata
  function inferCategory(title, wdgHint) {
    var t = (title || '').toLowerCase();
    var w = (wdgHint || '').toLowerCase();

    // 1. Pooja / Religious Needs (distinct priority)
    if (/\b(pooja|puja|agarbatti|incense|camphor|diya|havan|dhoop|chandan|kapoor|cotton\s*wicks?|batti|sambrani|gopuram|mangalam|holy|rakhi|rakshabandhan|rakhee|rakshasutra|lumba|raakhee)\b/i.test(t)) {
      return 'Pooja & Religious Needs';
    }

    // 2. Snacks, Sweets & Treats
    if (/\b(chocolate|chocolates|chips|namkeen|biscuit|biscuits|cookies|cookie|kurkure|sweets|mithai|chikki|popcorn|nachos|makhana|candies|candy|cake|cakes|brownie|dry\s*fruits|nuts|almonds|cashews|raisins|peanuts)\b/i.test(t)) {
      return 'Snacks, Sweets & Treats';
    }

    // 3. Dairy, Bread & Eggs
    if (/\b(milk|curd|yogurt|paneer|cheese|butter|bread|eggs?|fresh\s*cream|whipping\s*cream|cooking\s*cream|dairy\s*whitener)\b/i.test(t) || w.indexOf('dairy') !== -1) {
      return 'Dairy, Bread & Eggs';
    }

    // 4. Grocery & Staples
    if (/\b(atta|flour|rice|dal|dals|pulses|chana|cooking\s*oil|mustard\s*oil|sunflower\s*oil|refined\s*oil|ghee|salt|sugar|masala|spices|poha|daliya|soya|grains|besan|maida|sooji)\b/i.test(t) || w.indexOf('grocery') !== -1) {
      return 'Grocery & Staples';
    }

    // 5. Beverages & Drinks
    if (/\b(tea|coffee|juice|juices|coke|pepsi|cola|drink|drinks|soda|energy\s*drink|milkshake|lassi|buttermilk|squash|syrup)\b/i.test(t)) {
      return 'Beverages & Drinks';
    }

    // 6. Ice Creams & Frozen
    if (/\b(ice\s*cream|cornetto|kulfi|frozen)\b/i.test(t)) {
      return 'Ice Creams & Frozen';
    }

    // 7. Personal Care & Beauty
    if (/\b(shampoo|conditioner|soap|body\s*wash|face\s*wash|lotion|serum|sunscreen|cream|moisturiz|perfume|deodorant|deo|lipstick|kajal|makeup|skincare|hair|facial)\b/i.test(t) || w.indexOf('beauty') !== -1) {
      return 'Personal Care & Beauty';
    }

    // 8. Oral Care & Health
    if (/\b(toothpaste|toothbrush|mouthwash|protein|supplement|vitamins?|creatine|condom)\b/i.test(t)) {
      return 'Oral Care & Health';
    }

    // 9. Home Care & Cleaning
    if (/\b(detergent|liquid\s*wash|dishwash|cleaner|lizol|harpic|mop|broom|repellent|garbage\s*bags?|napkin|tissue|fabric|vanish|comfort|surf|aerial|tide)\b/i.test(t) || w.indexOf('home') !== -1) {
      return 'Home & Cleaning';
    }

    // 10. Kitchen & Dining
    if (/\b(cooker|chopper|bottle|flask|container|tiffin|pan|knife|kettle|plate|glass|mug|utensil|board)\b/i.test(t) || w.indexOf('kitchen') !== -1) {
      return 'Kitchen & Dining';
    }

    // 11. Electronics & Gadgets
    if (/\b(watch|smartwatch|cable|charger|earphones?|headphones?|mouse|keyboard|power\s*bank|adapter|battery|bulb|led|tech)\b/i.test(t) || w.indexOf('ce_') !== -1 || w.indexOf('pc_') !== -1) {
      return 'Electronics & Gadgets';
    }

    // 12. Luggage & Bags
    if (/\b(backpack|bag|suitcase|trolley|duffle|wallet|pouch)\b/i.test(t) || w.indexOf('luggage') !== -1) {
      return 'Luggage & Bags';
    }

    // 13. Baby Care
    if (/\b(diaper|diapers|baby\s*wipes?|baby\s*lotion|baby\s*wash|baby\s*oil)\b/i.test(t) || w.indexOf('baby') !== -1) {
      return 'Baby Care';
    }

    // Fallback: Clean WDG hint or 'General'
    if (w) {
      var cleanWdg = w.replace(/_display_on_website/g, '').replace(/_/g, ' ').trim();
      return cleanWdg.charAt(0).toUpperCase() + cleanWdg.slice(1);
    }

    return 'General Essentials';
  }

  // Extract brand from product data and title
  function extractBrand(title, y) {
    var rawBrand =
      (y && y.brand && (typeof y.brand === 'string' ? y.brand : (y.brand.name || y.brand.displayName || y.brand.text))) ||
      (y && y.brandName) ||
      (y && y.brandText) ||
      (y && y.byLine) ||
      (y && y.byline) ||
      (y && y.brandOrManufacturer) ||
      (y && y.manufacturer) ||
      (y && y.productOverview && y.productOverview.brand) ||
      (y && y.attributes && y.attributes.brand) ||
      '';

    if (typeof rawBrand === 'string' && rawBrand.trim()) {
      return rawBrand.replace(/^(by|brand:)\s+/i, '').trim();
    }

    if (y && y.extraProductDetails && Array.isArray(y.extraProductDetails)) {
      for (var i = 0; i < y.extraProductDetails.length; i++) {
        var epd = y.extraProductDetails[i];
        if (epd && (epd.id === 'manufacturer' || epd.id === 'brand') && typeof epd.value === 'string' && epd.value.trim()) {
          return epd.value.trim();
        }
      }
    }

    if (!title || typeof title !== 'string') return '';
    var t = title.trim();
    var tl = t.toLowerCase();

    var multiBrands = [
      'cadbury dairy milk',
      'surf excel',
      'coca-cola',
      'thums up',
      'tata sampann',
      'tata salt',
      'tata tea',
      'dairy milk',
      'red label',
      'mother dairy',
      'paper boat',
      'raw pressery',
      'too yumm',
      'real fruit',
      'b natural',
      'brooke bond',
      'taj mahal',
      'sleepy owl',
      'blue tokai',
      'the whole truth',
      'whole truth',
      'open secret',
      'yoga bar',
      'wingreens farms',
      "ching's secret",
      'chings secret',
      'top ramen',
      'wai wai',
      '24 mantra',
      'two brothers',
      'organic india',
      'forest essentials',
      'kama ayurveda',
      'the derma co',
      "dr. sheth's",
      'dr sheths',
      'plum goodness',
      'head & shoulders',
      "l'oreal paris",
      'loreal paris',
      'godrej no.1',
      'good knight',
      'all out',
      'muscleblaze',
      'muscle blaze',
      'optimum nutrition',
      'fast&up',
      'comfort after wash',
      'clinic plus',
      'country delight',
      'milky mist',
      'uncle chipps',
      'red bull',
      'mountain dew',
      'amazon basics',
      'amazon brand',
      'american tourister',
      'mother sparsh'
    ];

    for (var m = 0; m < multiBrands.length; m++) {
      var mb = multiBrands[m];
      if (tl.indexOf(mb) === 0) {
        return t.slice(0, mb.length).trim();
      }
    }

    var cleanTokens = t.split(/\s+/).filter(Boolean);
    if (cleanTokens.length === 0) return '';

    var first = cleanTokens[0];
    if (/^\d+%?$/.test(first) && cleanTokens.length > 1) {
      return first + ' ' + cleanTokens[1];
    }

    first = first.replace(/[,;:\-\.]*$/, '');
    return first;
  }

  // Parse product object from Tez API
  function parseProduct(y, defaultCat) {
    if (!y || !y.asin) return null;

    var disc = y.savings && y.savings.percentage ? parseInt(y.savings.percentage, 10) : 0;
    var bp = y.buyingPrice ? y.buyingPrice.amount : null;
    var lp = y.listPrice ? y.listPrice.amount : null;

    if (!disc && lp && bp && lp > bp) {
      disc = Math.round(((lp - bp) / lp) * 100);
    }

    var img =
      (y.heroImage && (y.heroImage.mediumResImageUrl || y.heroImage.lowResImageUrl || y.heroImage.highResImageUrl)) ||
      (y.productImages && y.productImages[0] && (y.productImages[0].lowResImageUrl || y.productImages[0].highResImageUrl)) ||
      '';

    var rawBrand = extractBrand(y.title, y);

    var categories = [];
    if (defaultCat && typeof defaultCat === 'string' && defaultCat.trim()) {
      categories.push(defaultCat.trim());
    } else {
      categories.push(inferCategory(y.title || '', ''));
    }

    return {
      t: y.title || '',
      a: y.asin,
      bp: bp,
      lp: lp,
      d: disc,
      img: img,
      pz: y.packSize || '',
      b: rawBrand,
      c: categories
    };
  }

  // Resilient multi-layout pagination checker (Desktop + Mobile + Touch responsive layouts)
  function hasNextSearchPage(doc, targetPage, totalCards) {
    if (!doc) return false;

    // 1. Check for explicit disabled next indicator (terminal page on desktop & mobile)
    if (
      doc.querySelector(
        '.s-pagination-next.s-pagination-disabled, span.s-pagination-item.s-pagination-disabled, li.a-disabled.a-last, li.a-last.a-disabled, [aria-disabled="true"].s-pagination-next'
      )
    ) {
      return false;
    }

    // 2. Desktop selectors for next page button or specific target page number
    if (
      doc.querySelector(
        '.s-pagination-next:not(.s-pagination-disabled), a[href*="page=' + targetPage + '"], a[href*="&page=' + targetPage + '&"]'
      )
    ) {
      return true;
    }

    // 3. Mobile selectors for next page (<ul class="a-pagination"><li class="a-last"><a>...</a></li>)
    var mobileNext = doc.querySelector(
      'li.a-last:not(.a-disabled) a, .a-pagination .a-last:not(.a-disabled) a, div[widgetid="pagination-button"] li.a-last:not(.a-disabled) a'
    );
    if (mobileNext) {
      return true;
    }

    // 4. Mobile ref markers and pagination links (e.g. ref=is_pp_2, ref=sr_pg_2)
    if (
      doc.querySelector(
        'a[href*="ref=is_pp_' + targetPage + '"], a[href*="ref=sr_pg_' + targetPage + '"], a[href*="ref=is_pp_"], a[href*="ref=sr_pg_"]'
      )
    ) {
      return true;
    }

    // 5. Generic next link with aria-label or class
    if (doc.querySelector('a[aria-label*="Next" i]:not([aria-disabled="true"]), a.a-last:not(.a-disabled)')) {
      return true;
    }

    // 6. Heuristic: if current page returned a full page of results (>= 12 cards) and no terminal indicator
    if (typeof totalCards === 'number' && totalCards >= 12) {
      return true;
    }

    return false;
  }

  // Parse HTML page from Amazon Now Global Search (/s?i=amazontez)
  function parseHtmlSearchPage(htmlText) {
    var doc = new DOMParser().parseFromString(htmlText, 'text/html');
    var cards = doc.querySelectorAll('div[data-asin]:not([data-asin=""])[data-component-type="s-search-result"]');
    if (!cards || cards.length === 0) {
      cards = doc.querySelectorAll('div[data-asin]:not([data-asin=""])');
    }
    var parsed = [];
    var seenInPage = {};

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var asin = card.getAttribute('data-asin');
      if (!asin || seenInPage[asin]) continue;

      // Skip sponsored cards
      if (card.querySelector('.puis-sponsored-label-text, [data-component-type="sp-sponsored-result"]')) {
        continue;
      }

      var titleEl = card.querySelector('h2 span, h2 a span, h2, [data-cy="title-recipe"]');
      if (!titleEl) continue;
      var title = titleEl.textContent.trim();
      if (!title) continue;

      var offerEl = card.querySelector('[data-csa-c-price-to-pay][data-csa-c-strike-through-price]') || card.querySelector('[data-csa-c-price-to-pay]');
      var bp = null;
      var lp = null;

      if (offerEl) {
        var bpAttr = offerEl.getAttribute('data-csa-c-price-to-pay');
        var lpAttr = offerEl.getAttribute('data-csa-c-strike-through-price');
        bp = parsePrice(bpAttr);
        lp = parsePrice(lpAttr);
      }

      if (bp === null || isNaN(bp)) {
        var priceTextEl = card.querySelector('.a-price:not([data-a-strike]) .a-offscreen');
        if (priceTextEl) bp = parsePrice(priceTextEl.textContent);
      }
      if (lp === null || isNaN(lp)) {
        var mrpTextEl = card.querySelector('.a-price[data-a-strike] .a-offscreen');
        if (mrpTextEl) lp = parsePrice(mrpTextEl.textContent);
      }

      if (bp === null || isNaN(bp)) continue;
      if (lp === null || isNaN(lp)) lp = bp;

      var disc = lp > bp ? Math.round(((lp - bp) / lp) * 100) : 0;
      if (!disc) {
        var discTextMatch = card.textContent.match(/\((\d+)%\s*off\)/i);
        if (discTextMatch) disc = parseInt(discTextMatch[1], 10);
      }

      var imgEl = card.querySelector('img.s-image');
      var img = imgEl ? (imgEl.getAttribute('src') || '') : '';

      var hintEl = card.querySelector('[data-wdg]');
      var wdgAttr = hintEl ? (hintEl.getAttribute('data-wdg') || '') : '';
      var cat = inferCategory(title, wdgAttr);

      seenInPage[asin] = true;
      parsed.push({
        t: title,
        a: asin,
        bp: bp,
        lp: lp,
        d: disc,
        img: img,
        pz: '',
        b: extractBrand(title, null),
        c: [cat]
      });
    }

    return {
      items: parsed,
      totalCards: (cards && cards.length) || parsed.length
    };
  }


const SCOUT_STYLE="*{box-sizing:border-box}:host,body{font:14px/1.45 'Avenir Next',Avenir,-apple-system,BlinkMacSystemFont,sans-serif;color:#1c3028}body{margin:0;background:#f4f3eb}button,input,select,textarea{font:inherit;color:inherit}button,select,input,textarea{border:1px solid #d5dacf;border-radius:10px;padding:9px 11px;background:#fff}button{cursor:pointer;font-weight:700}button:hover{border-color:#506c56}button:disabled{opacity:.45;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #839d28;outline-offset:2px}.primary{background:#d9ef71;color:#173526;border-color:#cfe465;font-weight:850}\n#panel{position:fixed;z-index:2147483645;right:16px;top:74px;width:360px;max-width:calc(100vw - 24px);max-height:82vh;background:#fffef8;border:1px solid #d5dacf;border-radius:18px;box-shadow:0 18px 60px #152a2630;display:flex;flex-direction:column;overflow:hidden}#panel[hidden]{display:none}#panel>header{padding:12px 14px;background:#f1f3e9;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e0e5d7}.app-title{display:flex;gap:10px;align-items:center}.app-title h3{margin:0;font-size:15px;letter-spacing:-.25px}.app-title small{font-size:10px}.app-mark{display:grid;place-items:center;width:32px;height:32px;background:#1e3d2d;color:#e5f5ac;border-radius:10px}#min{padding:6px 11px;min-width:36px}.body{padding:12px 14px;overflow:auto}.location-note{margin-bottom:10px}.panel-section{border:1px solid #e3e7dc;border-radius:14px;padding:10px;margin-bottom:10px;background:#fff}.category-tools{display:flex;justify-content:space-between;align-items:center;gap:8px}.category-tools b{font-size:12px}.category-tools small{font-size:10px}.category-tools>div:last-child{display:flex;gap:5px}.category-tools button{font-size:10px;padding:5px 8px}.search-settings label{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:10px;font-size:11px;font-weight:700}.search-settings select{width:100%;font-size:11px;padding:8px}.search-settings>small{font-size:10px;margin-top:4px}small{display:block;color:#657365}#cats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;max-height:160px;overflow:auto;margin-top:9px;padding-right:3px}#cats label{display:flex;align-items:center;gap:6px;min-width:0;padding:7px 8px;border:1px solid #e3e7dc;border-radius:9px;background:#fafbf6;font-size:10px;line-height:1.2;cursor:pointer}#cats input{width:14px;height:14px;flex:0 0 auto;accent-color:#294b36}textarea{width:100%;margin:7px 0;padding:9px}.product-search{font-size:11px}.product-search summary{font-weight:700}.product-search button{width:100%}#scan,#quick{width:100%;margin-top:8px;font-size:12px;padding:10px}#panel>footer{padding:10px 14px 12px;background:#f1f3e9;border-top:1px solid #e0e5d7}progress{display:block;width:100%;accent-color:#476732;height:6px;border:0;border-radius:10px;overflow:hidden}progress::-webkit-progress-bar{background:#e1e5d7}progress::-webkit-progress-value{background:#789535;border-radius:10px}#progress{font-size:11px;font-weight:750;margin:7px 0 2px}#progress[data-state=error]{color:#a83b37}#progress[data-state=partial],#progress[data-state=stopped]{color:#86601f}#detail,#errors{overflow-wrap:anywhere;font-size:10px}#errors{white-space:pre-wrap;max-height:80px;overflow:auto}.footer-actions{display:grid;grid-template-columns:.7fr 1.2fr 1fr;gap:6px;margin-top:7px}.footer-actions button{padding:8px 5px;font-size:10px}#launcher{position:fixed;bottom:20px;right:20px;z-index:2147483644;background:#1e3d2d;color:#e5f5ac;box-shadow:0 5px 20px #19322630;border:0;border-radius:40px;padding:12px 18px}\nmain{max-width:1780px;margin:auto;padding:14px 24px 48px}.compact-header{display:grid;grid-template-columns:minmax(190px,.65fr) minmax(320px,1.4fr) auto;gap:18px;align-items:center;padding:8px 0 12px;border-bottom:1px solid #d7dccb}.compact-header h1{font-size:26px;line-height:1.1;letter-spacing:-1px;margin:2px 0 0}.eyebrow{font-size:9px;letter-spacing:1.5px;color:#75816d}.compact-status{min-width:0}#rs-status{font-size:11px;font-weight:700;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.compact-actions{display:flex;gap:7px}.compact-actions button{font-size:11px;padding:8px 11px;background:transparent}#rs-new{border-color:#b2c891}.results-workspace{display:block}.filters{min-width:0}.filters .tools{display:grid;grid-template-columns:auto minmax(180px,1.3fr) repeat(2,minmax(145px,.75fr)) minmax(135px,.65fr) auto;gap:7px;align-items:center;margin:11px 0 9px;padding:8px 10px;background:#eef1e5;border:1px solid #d5ddc8;border-radius:12px;position:sticky;top:7px;z-index:10}.filter-title{font-size:12px;white-space:nowrap}.tools input,.tools select,.tools button{min-width:0;width:100%;font-size:11px;padding:8px 9px}.tools button{background:#223e2f;color:white;border-color:#223e2f}.category-strip{display:flex;gap:6px;overflow:auto;padding:1px 1px 8px;scrollbar-width:thin}.category-strip button{flex:0 0 auto;border-radius:999px;padding:6px 10px;font-size:10px;background:#fffef9}.category-strip button.active{background:#1e3d2d;color:#fff;border-color:#1e3d2d}.results-line{display:flex;align-items:center;justify-content:space-between;margin:5px 2px 10px}#rs-count{margin:0;font-size:11px;color:#64715e}.sort-note{font-size:9px;letter-spacing:1.2px;color:#7f8c72}#rs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:11px}.card{display:flex;flex-direction:column;border:1px solid #e0e4d9;border-radius:14px;background:#fffef9;color:#203629;text-decoration:none;min-width:0;overflow:hidden;transition:transform .18s,box-shadow .18s}.card:hover{transform:translateY(-3px);box-shadow:0 12px 26px #1f352614;border-color:#b6c49c}.media{position:relative;height:160px;background:#fff;display:flex;align-items:center;justify-content:center;margin:6px;border-radius:10px;overflow:hidden}.card img{width:79%;height:80%;object-fit:contain;mix-blend-mode:multiply}.badge{position:absolute;top:4px;right:4px;background:#dced83;color:#243c21;padding:6px 8px;border-radius:5px 10px 5px 10px;display:flex;align-items:baseline;gap:2px;box-shadow:0 2px 0 #bdcf6d}.badge strong{font-size:16px;line-height:1}.badge span{font-size:7px;font-weight:900}.card-body{padding:7px 11px 12px;display:flex;flex-direction:column;flex:1}.name{font-size:12px;line-height:1.35;font-weight:700;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:33px}.pack{font-size:10px;color:#7c8576;margin:5px 0 9px;min-height:15px}.price-row{display:flex;gap:6px;align-items:baseline;flex-wrap:wrap;margin-top:auto;padding-top:8px;border-top:1px solid #edf0e4}.price{font-size:19px;font-weight:800;letter-spacing:-.5px}.mrp{font-size:9px;color:#8a9182;white-space:nowrap}.mrp s{font-size:10px;margin-left:3px}.coverage{margin:20px 0 0;padding:10px 0;border-top:1px solid #d8dfca;color:#68785e;font-size:11px}#rs-errors{white-space:pre-wrap;color:#92512e;font-size:10px;max-height:180px;overflow:auto}.empty{padding:38px 18px;color:#6b7767;text-align:center;grid-column:1/-1;background:#fffef9;border-radius:14px}.source-note{font-size:10px;color:#859079;margin-top:22px}.pin-row{padding:8px 0}.pin-row input{width:100%;margin:5px 0}#locate{width:100%;margin:3px 0 7px;font-size:11px}summary{padding:5px 0;cursor:pointer}.location-status{font-size:11px;padding:7px 0;color:#556849}\n.pocket-results{background:#edf3ec}.pocket-results main{max-width:430px;min-height:100vh;padding:10px 12px 36px;background:#fffef9}.pocket-results .compact-header{grid-template-columns:1fr auto;gap:8px}.pocket-results .compact-header h1{font-size:24px}.pocket-results .compact-status{grid-column:1/-1;grid-row:2}.pocket-results .compact-actions{grid-column:2;grid-row:1}.pocket-results .filters .tools{position:static;grid-template-columns:1fr 1fr;margin:9px 0}.pocket-results .filter-title,.pocket-results .filters .tools input,.pocket-results .filters .tools button{grid-column:1/-1}.pocket-results #rs-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.pocket-results .media{height:128px;margin:4px}.pocket-results .card-body{padding:7px 9px 10px}.pocket-results .name{font-size:11px;min-height:31px}.pocket-results .price{font-size:18px}.pocket-results .sort-note{display:none}\n@media(min-width:1500px){#rs-grid{grid-template-columns:repeat(7,1fr)}}@media(max-width:900px){.compact-header{grid-template-columns:1fr auto}.compact-status{grid-column:1/-1;grid-row:2}.filters .tools{position:static;grid-template-columns:1fr 1fr}.filter-title,.filters .tools input,.filters .tools button{grid-column:1/-1}}@media(max-width:600px){#panel{top:max(8px,env(safe-area-inset-top));right:8px;width:calc(100vw - 16px);max-height:calc(100dvh - 16px);border-radius:16px}#panel button{min-height:40px}#cats{max-height:185px}#cats label{min-height:38px;font-size:11px}#panel>footer{padding-bottom:max(10px,env(safe-area-inset-bottom))}#launcher{bottom:max(12px,env(safe-area-inset-bottom));max-width:calc(100vw - 24px)}main{padding:10px 11px 34px}.swift-results #rs-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.sort-note{display:none}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}\n";
/* Small public-data helpers shared by the six scouts. */
var MarketplaceCore=(()=>{
 const isMobile=n=>n?.userAgentData?.mobile===true||/Android|iPhone|iPad|iPod|Mobile/i.test(n?.userAgent||'');
 const money=value=>'₹'+Number(value).toLocaleString('en-IN',{minimumFractionDigits:Number.isInteger(Number(value))?0:2,maximumFractionDigits:2});
 const displayMrp=p=>Number(p.mrp)>=Number(p.price)&&Number(p.mrp)>0?money(p.mrp):null;
 function bbMore(info,count){if(info?.has_next_page===false)return false;if(Number(info?.number_of_pages)>0&&Number(info?.page)>0)return Number(info.page)<Number(info.number_of_pages);return true;}
 function jioContext({pin,geo,stores,journey}){
  if(journey!=='quick'&&journey!=='quickcommerce')throw Error('Open the Quick tab on JioMart first.');
  if(!/^\d{6}$/.test(String(pin?.pincode||''))||!Number.isFinite(Number(geo?.latitude))||!Number.isFinite(Number(geo?.longitude))||!geo?.latitude||!geo?.longitude)throw Error('Select your JioMart Quick delivery location first.');
  const selected=Object.values(stores||{}).filter(s=>s.uid&&s.is_accepting_order===true&&s.timings?.open!==false&&(s.journey_wise_promise||[]).some(p=>p.journey==='quickcommerce'));
  const ids=[...new Set(selected.map(s=>String(s.uid)))],polygons=[...new Set(selected.flatMap(s=>s.journey_wise_promise.filter(p=>p.journey==='quickcommerce').map(p=>p.meta?.polygon_id)).filter(Boolean))];
  if(!ids.length||!polygons.length)throw Error('No selected serviceable Quick store. Refresh JioMart Quick and select your delivery location.');
  return {pin:{country:'INDIA',country_iso_code:'IN',...pin},geo:{latitude:geo.latitude,longitude:geo.longitude,polygon_ids:polygons},ids};
 }
 function jioProduct(p){const e=p.price?.effective,m=p.price?.marked;if(!(Number(e?.min)>0)||Number(e.min)!==Number(e.max))return null;const price=Number(e.min),mrp=Number(m?.min)===Number(m?.max)&&Number(m?.min)>=price?Number(m.min):null;return {id:String(p.uid),name:p.name,pack:p.attributes?.net_quantity||p.attributes?.pack_size||'',price,mrp,image:p.medias?.[0]?.url,url:'https://www.jiomart.com/product/'+encodeURIComponent(p.slug||''),brand:p.brand?.name,categories:(p.categories||[]).map(c=>c.name),category:p.categories?.[0]?.name||'',soldOut:p.sellable===false};}
 return {isMobile,money,displayMrp,bbMore,jioContext,jioProduct};
})();

/* Local scan lifecycle. No marketplace writes. */
var DealScoutCore = (() => {
  const categoryValues=p=>[...new Set([p.category,p.parentCategory,...(p.categories||[])].filter(x=>typeof x==='string'&&x.trim()))];
  const beverageCategory=value=>!/^search bucket|^keyword results|^keyword search/i.test(value)&&/beverage|drink|juice|soda|coffee|tea\b|water|cola/i.test(value);
  const categoryMatch=(p,value)=>categoryValues(p).some(c=>c.toLowerCase()===value.toLowerCase()||(value==='Beverages'&&beverageCategory(c)));
  const tasks = (groups, selected) => groups.filter(g=>selected.has(g.id)).flatMap(g=>g.tasks.map(t=>({...t,category:g.name})));
  const keywordTasks=(groups,selected)=>[...new Map(groups.filter(g=>selected.has(g.id)).flatMap(g=>(g.keywords||[g.name]).map(name=>({name,keyword:true,category:'Keyword results · taxonomy unverified',sourceGroup:g.name,pageLimit:2}))).map(t=>[t.name.toLowerCase(),t])).values()];
  function pacer(interval){
    let next=0,tail=Promise.resolve();
    return signal=>{const turn=tail.then(async()=>{signal.throwIfAborted();const wait=Math.max(0,next-Date.now());if(wait)await new Promise((resolve,reject)=>{const cancel=()=>{clearTimeout(timer);reject(new DOMException('Stopped','AbortError'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},wait);signal.addEventListener('abort',cancel,{once:true});});signal.throwIfAborted();next=Date.now()+interval;});tail=turn.catch(()=>{});return turn;};
  }
  const previewTasks=(groups,selected)=>[...new Map(groups.filter(g=>selected.has(g.id)).flatMap(g=>{
    const words=/drink|juice|beverage/i.test(g.name)?['diet coke','soft drinks','juice']:(g.keywords||[g.name]).slice(0,1);
    return words.map(name=>({name,keyword:true,category:g.name,discovery:'Fast preview',sourceGroup:g.name,pageLimit:1}));
  }).map(t=>[t.name.toLowerCase(),t])).values()];
  async function deadline(work,signal,ms,label='Setup'){
    const child=new AbortController();const abort=()=>child.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)child.abort();let timer,cancel;
    try{return await Promise.race([Promise.resolve().then(()=>{child.signal.throwIfAborted();return work(child.signal);}),new Promise((_,reject)=>{timer=setTimeout(()=>{reject(Error(label+' timed out. Retry when the website is ready.'));child.abort();},ms);cancel=()=>reject(new DOMException('Stopped','AbortError'));child.signal.addEventListener('abort',cancel,{once:true});})]);}
    finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);child.signal.removeEventListener('abort',cancel);}
  }
  function runner({request, context=()=>'', onChange=()=>{}, timeout=45000, idleTimeout=0, delay=0, concurrency=1}) {
    let generation=0, controller=null, items=new Map();
    const fresh=()=>({status:'idle',stopRequested:false,total:0,processed:0,succeeded:0,failed:0,limited:0,pages:0,current:'',detail:'',errors:[],coverage:[],started:0,ended:0});
    let state=fresh();
    function ingest(batch,task){for(const p of batch){
      const price=Number(p.price),mrp=Number(p.mrp);if(!(price>0&&p.name)||p.soldOut===true)continue;
      const key=p.id||p.url||p.name+'|'+(p.pack||'');const old=items.get(key);
      const parentCategory=p.parentCategory||task.category||'';
      const categories=[...new Set([...categoryValues(old||{}),...categoryValues(p),parentCategory].filter(Boolean))];
      items.set(key,{...p,price,mrp:mrp>=price?mrp:null,discount:mrp>=price?Math.round((mrp-price)/mrp*10000)/100:null,category:p.discovery&&old?.category&&!old.discovery?old.category:p.category||parentCategory||'Unclassified',subcategory:p.subcategory||old?.subcategory||'',parentCategory,categories});
    }}
    const api={get state(){return {...state,errors:[...state.errors]};},get items(){return [...items.values()].sort((a,b)=>b.discount-a.discount||a.price-b.price);},
      reset(){generation++;controller?.abort();items.clear();state=fresh();onChange({...state});},
      stop(){if(state.status!=='running'||!controller||state.stopRequested)return;state.stopRequested=true;state.detail='Stopping…';onChange({...state});controller.abort();},
      async start(queue,{budget=0}={}){
        api.reset();const runId=generation;controller=new AbortController();const parent=controller;
        state={...fresh(),status:'running',total:queue.length,started:Date.now()};
        const original=context();let consecutive=0,budgetTimer,budgetEnded=false;onChange({...state});
        if(budget)budgetTimer=setTimeout(()=>{if(runId!==generation)return;budgetEnded=true;state.detail='Fast preview time limit reached; unfinished checks remain visible.';parent.abort();},budget);
        try {
          if(!queue.length)throw Error('Select at least one category or enter a keyword.');
          let cursor=0,halted=false,fatal=null;const active=new Map();
          const updateActive=()=>{state.active=active.size;state.current=[...active.values()].join(' · ');};
          async function worker(workerId){while(cursor<queue.length&&!halted&&!parent.signal.aborted&&runId===generation){
            const task=queue[cursor++];
            if(context()!==original){items.clear();fatal=Error('Delivery location changed. Start a fresh scan.');halted=true;parent.abort();return;}
            active.set(workerId,task.name);updateActive();state.detail='Connecting…';let taskPages=0;onChange({...state});
            const child=new AbortController();const abort=()=>child.abort();parent.signal.addEventListener('abort',abort,{once:true});
            let timer,idleTimer,cancel;
            try {
              let idleReject;const idle=new Promise((_,reject)=>idleReject=reject);
              const armIdle=()=>{if(idleTimeout){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{child.abort();idleReject(Error('This page timed out. Please try this category again.'));},idleTimeout);}};
              armIdle();
              const work=Promise.resolve().then(()=>request(task,child.signal,(batch=[],detail='',page=false)=>{
                if(runId!==generation||child.signal.aborted)return;
                if(context()!==original){items.clear();throw Error('Delivery location changed. Start a fresh scan.');}
                state.detail=detail;if(page){state.pages++;taskPages++;armIdle();}
                ingest(batch,task);if(items.size&&state.firstResultsMs===undefined)state.firstResultsMs=Date.now()-state.started;onChange({...state});
              }));
              const limit=new Promise((_,reject)=>{timer=setTimeout(()=>{child.abort();reject(Error('Request timed out. Retry this category.'));},timeout);});
              const cancelled=new Promise((_,reject)=>{cancel=()=>reject(new DOMException('Stopped','AbortError'));parent.signal.addEventListener('abort',cancel,{once:true});});
              const result=await Promise.race([work,limit,idle,cancelled]);
              if(runId!==generation)return;
              if(context()!==original){items.clear();throw Error('Delivery location changed. Start a fresh scan.');}
              if(Array.isArray(result)){
                ingest(result,task);if(items.size&&state.firstResultsMs===undefined)state.firstResultsMs=Date.now()-state.started;
              }
              if(result?.truncated){state.limited++;state.detail=result.reason||'More products remain beyond the page limit.';}
              state.coverage.push({name:task.name,pages:taskPages,status:result?.truncated?'incomplete':'checked',reason:result?.reason||''});
              state.succeeded++;consecutive=0;
            }catch(e){
              if(runId!==generation)return;
              if(parent.signal.aborted)return;
              state.failed++;consecutive++;state.errors.push(task.name+': '+e.message);state.coverage.push({name:task.name,pages:taskPages,status:'failed',reason:e.message});
              if(/location changed/i.test(e.message)){items.clear();fatal=e;halted=true;parent.abort();return;}
              if(/(?:HTTP|Search|BFF)\s*(?:401|403|429)/i.test(e.message)||consecutive>=3){state.detail='Stopped after access errors. Open a normal search, then retry.';halted=true;parent.abort();}
            }finally{clearTimeout(timer);clearTimeout(idleTimer);parent.signal.removeEventListener('abort',abort);if(cancel)parent.signal.removeEventListener('abort',cancel);active.delete(workerId);if(runId===generation)updateActive();}
            state.processed++;onChange({...state});
            if(delay&&cursor<queue.length&&!parent.signal.aborted)await new Promise(r=>{const t=setTimeout(r,delay);parent.signal.addEventListener('abort',()=>{clearTimeout(t);r();},{once:true});});
          }}
          await Promise.all(Array.from({length:Math.min(queue.length,Math.max(1,Math.min(3,concurrency)))},(_,i)=>worker(i)));
          if(fatal)throw fatal;
          if(runId!==generation)return;
          state.remaining=state.total-state.processed;state.budgetReached=budgetEnded&&state.remaining>0;
          if(state.budgetReached){state.coverage.push({name:'Remaining preview checks',pages:0,status:'incomplete',reason:(state.total-state.processed)+' checks were not completed within the preview time limit.'});state.limited++;}
          state.status=state.failed?(items.size?'partial':'error'):state.budgetReached?(items.size?'partial':'stopped'):parent.signal.aborted?'stopped':state.limited?'partial':state.processed===state.total?'done':'stopped';
          if(state.status==='stopped'&&state.stopRequested)state.detail='Stopped by you.';
        }catch(e){if(runId!==generation)return;state.errors.push(e.message);state.status='error';}
        finally{clearTimeout(budgetTimer);if(runId===generation){state.ended=Date.now();onChange({...state});}}
      }
    };return api;
  }
  return {tasks,keywordTasks,previewTasks,runner,pacer,deadline,categoryValues,categoryMatch,beverageCategory};
})();

/* Results are owned new tabs; shopping pages and previous results are never closed. */
function mountDealScout(adapter){
 const mobile=MarketplaceCore.isMobile(navigator);const ID='quick-deal-scout-v4-5';if(document.getElementById(ID)){document.getElementById(ID).shadowRoot.getElementById('panel').hidden=false;return;}
 const host=document.createElement('div');host.id=ID;document.body.append(host);const root=host.attachShadow({mode:'open'});
 const css=SCOUT_STYLE;
 root.innerHTML=`<style>${css}</style><button id="launcher">⚡ ${adapter.name} Scout v4.5</button><section id="panel"><header><div class="app-title"><span class="app-mark">⚡</span><div><h3>${adapter.name} Scout</h3><small>Deal finder · v4.5</small></div></div><button id="min" aria-label="Hide Scout">−</button></header><div class="body"><small class="location-note">${mobile?'Keep this tab open while Scout searches.':'Your selected delivery address is used.'}</small><section class="panel-section"><div class="category-tools"><div><b>Selected categories</b><small id="cat-count">Loading…</small></div><div><button id="all">All</button><button id="none">Clear</button></div></div><div id="cats">Loading categories…</div></section><section class="panel-section search-settings"><label><span>Search level</span><select id="pages"><option value="1" selected>Fast · first page</option><option value="2">Quick · first 2 pages</option><option value="5">More · first 5 pages</option><option value="20">Detailed · first 20 pages</option><option value="100">Maximum · up to 100 pages</option></select></label><button id="scan" class="primary" disabled>⚡ Find deals fast</button><button id="quick" disabled>Search every selected category</button><small>Fast search stops after 12 seconds. Pick a higher level only when you need more products.</small></section><details class="product-search"><summary>Search for one product</summary><textarea id="keywords" rows="2" placeholder="diet coke, protein, air fryer"></textarea><button id="custom">Search these words</button></details></div><footer><progress id="bar" value="0" max="1"></progress><div id="progress" role="status" aria-live="polite">Ready for a new search</div><small id="detail"></small><details><summary>Search notes</summary><pre id="errors"></pre></details><div class="footer-actions"><button id="stop" disabled>Stop</button><button id="view" disabled>Open results</button><button id="reset">New search</button></div></footer></section>`;
 const $=id=>root.getElementById(id);const node=(doc,tag,text)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 if(adapter.requiresPin){const label=node(document,'label','Delivery PIN'),input=node(document,'input');label.className='pin-row';input.id='locationpin';input.inputMode='numeric';input.maxLength=6;input.placeholder='Selected address PIN';input.value=adapter.getPin();input.oninput=()=>adapter.setPin(input.value.trim());label.append(input);$('cats').before(label);}
 if(adapter.setAutoLocate){const label=node(document,'label'),check=node(document,'input');check.id='auto-locate';check.type='checkbox';check.checked=true;check.onchange=()=>adapter.setAutoLocate(check.checked);label.append(check,document.createTextNode(' '+(adapter.autoLocateLabel||'Use current location if needed')));$('cats').before(label);}
 if(adapter.useCurrentLocation){const locate=node(document,'button','⌖ Use my current location');locate.id='locate';locate.onclick=async()=>{if(preparing||runner.state.status==='running')return;reset();const token=++epoch;prepController=new AbortController();preparing=true;message='Opening the native location selector…';$('panel').hidden=true;render();try{await adapter.useCurrentLocation(prepController.signal);if(token!==epoch)return;if(adapter.requiresPin)$('locationpin').value=adapter.getPin();message='Current location selected.';}catch(e){if(token!==epoch)return;message=e.message;}finally{if(token===epoch){preparing=false;$('panel').hidden=false;render();}}};$('cats').before(locate);}


 let groups=[],active=null,preparing=false,epoch=0,message='',phaseError=false,prepController=null;
 const chosen=()=>new Set([...root.querySelectorAll('#cats input:checked')].map(x=>x.value));
 const safe=(v,image=false)=>{try{const u=new URL(v,location.origin);return /^https?:$/.test(u.protocol)&&(image||adapter.hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))?u.href:'';}catch{return '';}};
 const runner=DealScoutCore.runner({context:()=>adapter.context(),timeout:600000,idleTimeout:adapter.idleTimeout??25000,concurrency:adapter.concurrency??1,delay:adapter.delay??650,request:async(task,signal,emit)=>adapter.request(task,signal,emit,task.pageLimit),onChange:()=>render()});
 function summary(){const s=runner.state;if(preparing)return 'Getting your selected delivery address ready…';if(phaseError)return 'Cannot start · '+message;if(s.status==='idle')return 'Ready for a new search';const sec=Math.floor(((s.ended||Date.now())-s.started)/1000);return `${{running:'Searching',done:s.limited?'Finished · some results may be missing':'Search finished',partial:'Some results found',stopped:'Stopped',error:'Search failed'}[s.status]} · ${s.processed}/${s.total} searches checked · ${s.pages} pages · ${runner.items.length} products · ${s.failed} failed · ${sec}s`;}
 function render(){const s=runner.state,busy=preparing||s.status==='running';const text=summary();if($('progress').textContent!==text)$('progress').textContent=text;$('progress').dataset.state=phaseError?'error':s.status;$('bar').value=s.total?s.processed/s.total:0;const detail=message||[s.current,s.detail].filter(Boolean).join(' · ');if($('detail').textContent!==detail)$('detail').textContent=detail;$('errors').textContent=[...s.errors,...s.coverage.filter(x=>x.status==='incomplete').map(x=>x.name+': '+(x.reason||'More products may be available.'))].join('\n');
  const picked=chosen().size;if($('cat-count'))$('cat-count').textContent=groups.length?`${picked} of ${groups.length} selected`:'Loading…';$('stop').disabled=!busy||s.stopRequested;$('stop').textContent=s.stopRequested?'Stopping…':'Stop';$('view').textContent=mobile?'View results ↗':'Open results';$('view').disabled=!active&&!runner.items.length; $('scan').disabled=busy||!groups.length||!picked;$('quick').disabled=busy||!groups.length||!picked;
  for(const e of root.querySelectorAll('#cats input,#locationpin,#pages,#keywords,#custom,#sample,#auto-locate,#locate,#all,#none'))e.disabled=busy;
  if(active){active.items=runner.items;active.status=text;active.errors=$('errors').textContent;active.version=s.pages+'|'+s.processed+'|'+s.status+'|'+s.stopRequested;paint(active);}
 }
 function stopNow(){if(preparing){reset();return;}if(runner.state.status==='running'&&!runner.state.stopRequested)runner.stop();render();}
 function freeze(){if(active){active.status=summary()+' · Snapshot; next scan starts in the original shopping tab';active.items=runner.items;active.live=false;paint(active);active=null;}}
 function reset(){const wasPreparing=preparing;epoch++;prepController?.abort();prepController=null;preparing=false;if(wasPreparing)$('panel').hidden=false;freeze();runner.reset();$('keywords').value='';message='';phaseError=false;render();}
 function resultTab(){
  if(active&&!active.win.closed)return active;
  const win=window.open('','_blank');if(!win){message='Browser blocked the results tab. Click Open results tab, or allow popups for this site. The shopping page stays open.';render();return null;}
  win.document.title=adapter.name+' Deals · Scout v4.5';const doc=win.document;const encoding=node(doc,'meta');encoding.setAttribute('charset','utf-8');const viewport=node(doc,'meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';doc.head.prepend(encoding,viewport);doc.body.replaceChildren();doc.body.className=mobile?'pocket-results':'swift-results';const style=node(doc,'style',css);const main=node(doc,'main');doc.body.append(style,main);
  const v={win,root:main,items:runner.items,live:true,status:summary(),errors:'',stamp:''};active=v;
  const header=node(doc,'div');header.className='compact-header';const identity=node(doc,'div');const eyebrow=node(doc,'small','DEAL SCOUT · LIVE LOCAL PRICES');eyebrow.className='eyebrow';identity.append(eyebrow,node(doc,'h1',adapter.name+' deals'));header.append(identity);const statusBox=node(doc,'div');statusBox.className='compact-status';const status=node(doc,'div');status.id='rs-status';const progress=node(doc,'progress');progress.id='rs-progress';progress.max=1;statusBox.append(status,progress);header.append(statusBox);const actions=node(doc,'div');actions.className='compact-actions';const stop=node(doc,'button','Stop');stop.id='rs-stop';stop.onclick=()=>{if(v.live)stopNow();};const fresh=node(doc,'button','New search ↗');fresh.id='rs-new';fresh.onclick=()=>{if(v.live)reset();};actions.append(stop,fresh);header.append(actions);main.append(header);
  const tools=node(doc,'div');tools.className='tools';const filterTitle=node(doc,'strong','Filter results');filterTitle.className='filter-title';const q=node(doc,'input');q.id='rs-q';q.placeholder='Product or brand';const cat=node(doc,'select');cat.id='rs-cat';cat.append(node(doc,'option','All categories'));
  const deals=node(doc,'select');deals.id='rs-deals';for(const [value,label] of [['discounted','Discounted products'],['all','All products · include 0% / unknown discount']]){const o=node(doc,'option',label);o.value=value;deals.append(o);}
  const sort=node(doc,'select');sort.id='rs-sort';for(const [value,label] of [['discount','Highest discount'],['price','Lowest selling price'],['saving','Largest saving']]){const o=node(doc,'option',label);o.value=value;sort.append(o);}
  const csv=node(doc,'button','Download CSV');csv.onclick=()=>{const rows=[['name','pack','selling_price','mrp','discount_percent','parent_category','subcategory','all_categories','url'],...v.items.map(p=>[p.name,p.pack,p.price,p.mrp,p.discount,p.parentCategory,p.subcategory,DealScoutCore.categoryValues(p).join(' | '),p.url])];const text=rows.map(row=>row.map(value=>{let t=String(value??'');if(/^[=+@-]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';}).join(',')).join('\r\n');const u=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=node(doc,'a');a.href=u;a.download=adapter.name+'-deals.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);};tools.append(filterTitle,q,cat,deals,sort,csv);for(const e of [q,cat,deals,sort])e.oninput=()=>grid(v);
  const categories=node(doc,'nav');categories.className='category-strip';categories.setAttribute('aria-label','Product categories');const line=node(doc,'div');line.className='results-line';const count=node(doc,'p');count.id='rs-count';const orderNote=node(doc,'span','BEST DEALS FIRST');orderNote.className='sort-note';line.append(count,orderNote);const cards=node(doc,'div');cards.id='rs-grid';const notes=node(doc,'details');notes.className='coverage';notes.append(node(doc,'summary','Search notes'));const errors=node(doc,'pre');errors.id='rs-errors';notes.append(node(doc,'p','Fast search checks the first results. Choose a higher search level for more products. Prices apply to your selected delivery address.'),errors);const note=node(doc,'p','Products open in a new tab. Your shopping page and earlier results stay open.');note.className='source-note';const workspace=node(doc,'div');workspace.className='results-workspace';const filters=node(doc,'aside');filters.className='filters';filters.append(tools);const content=node(doc,'section');content.className='results-content';content.append(categories,line,cards,notes,note);workspace.append(filters,content);main.append(workspace);paint(v);return v;
 }

 function paint(v){if(v.win.closed)return;v.root.querySelector('#rs-status').textContent=v.status;const s=runner.state;v.root.querySelector('#rs-progress').value=s.total?s.processed/s.total:0;v.root.querySelector('#rs-errors').textContent=v.errors;const rsStop=v.root.querySelector('#rs-stop');if(rsStop){const busy=preparing||s.status==='running';rsStop.disabled=!busy||s.stopRequested;rsStop.textContent=s.stopRequested?'Stopping…':'Stop';}const stamp=v.items.length+'|'+v.version;if(stamp!==v.stamp){v.stamp=stamp;grid(v);}}
 function grid(v){const main=v.root,doc=main.ownerDocument,cat=main.querySelector('#rs-cat'),selected=cat.value;const values=[...new Set(v.items.flatMap(p=>DealScoutCore.categoryValues(p)))];if(values.some(DealScoutCore.beverageCategory))values.push('Beverages');cat.replaceChildren(node(doc,'option','All categories'));for(const name of [...new Set(values)].sort())cat.append(node(doc,'option',name));if([...cat.options].some(o=>o.value===selected))cat.value=selected;
  const strip=main.querySelector('.category-strip');if(strip){const names=['All categories',...[...new Set(values)].sort()];const chips=doc.createDocumentFragment();for(const name of names){const chip=node(doc,'button',name==='All categories'?'All':name);chip.type='button';chip.className=cat.value===name?'active':'';chip.onclick=()=>{cat.value=name;grid(v);};chips.append(chip);}strip.replaceChildren(chips);}
  const query=main.querySelector('#rs-q').value.toLowerCase(),all=main.querySelector('#rs-deals').value==='all',sort=main.querySelector('#rs-sort').value;
  const products=v.items.filter(p=>(all||p.discount>0)&&(!query||(p.name+' '+(p.brand||'')).toLowerCase().includes(query))&&(cat.value==='All categories'||DealScoutCore.categoryMatch(p,cat.value)));
  products.sort((a,b)=>sort==='price'?a.price-b.price:sort==='saving'?((b.mrp||b.price)-b.price)-((a.mrp||a.price)-a.price):(b.discount??-1)-(a.discount??-1));
  main.querySelector('#rs-count').textContent=`${products.length.toLocaleString('en-IN')} ${all?'products':'deals'} · ${v.items.length.toLocaleString('en-IN')} fetched`;
  const fragment=doc.createDocumentFragment();for(const p of products){const card=node(doc,'a');card.className='card';card.href=safe(p.url)||'#';card.target='_blank';card.rel='noopener noreferrer';const media=node(doc,'div');media.className='media';if(safe(p.image,true)){const img=node(doc,'img');img.src=safe(p.image,true);img.alt='';img.loading='lazy';media.append(img);}if(p.discount>0){const badge=node(doc,'span');badge.className='badge';badge.append(node(doc,'strong',Number(p.discount.toFixed(1))+'%'),node(doc,'span','OFF'));media.append(badge);}const body=node(doc,'div');body.className='card-body';const title=node(doc,'div',p.name);title.className='name';const pack=node(doc,'div',p.pack||'');pack.className='pack';const prices=node(doc,'div');prices.className='price-row';const price=node(doc,'span',MarketplaceCore.money(p.price));price.className='price';prices.append(price);const mrp=MarketplaceCore.displayMrp(p);if(mrp){const original=node(doc,'span','MRP');original.className='mrp';original.append(node(doc,'s',mrp));prices.append(original);}body.append(title,pack,prices);card.append(media,body);fragment.append(card);}if(!products.length){const empty=node(doc,'div',runner.state.status==='running'?'Finding your first deals…':'No matching products yet. Try All products or adjust your filters.');empty.className='empty';fragment.append(empty);}main.querySelector('#rs-grid').replaceChildren(fragment);

 }
 async function start(mode){if(preparing||runner.state.status==='running')return;const selected=chosen();if(!selected.size){message='Select at least one category.';render();return;}let queue;const limit=Number($('pages').value);
  if(mode==='custom'){const words=[...new Set($('keywords').value.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean))];if(!words.length){message='Enter a product or keyword.';render();return;}if(selected.size!==groups.length){message='Custom searches may cross categories. Check all categories or use the category scan.';render();return;}queue=words.map(name=>({name,keyword:true,category:'Keyword search',pageLimit:limit}));}
  else if(mode==='sample'&&adapter.previewTasks)queue=adapter.previewTasks(groups,selected);
  else if(mode==='sample'&&selected.size===groups.length)queue=DealScoutCore.previewTasks(groups,selected);
  else queue=mode==='quick'&&adapter.quickTasks?adapter.quickTasks(groups,selected):DealScoutCore.tasks(groups,selected).map(t=>({...t,pageLimit:mode==='sample'?1:mode==='quick'?2:limit}));
  reset();const token=++epoch;prepController=new AbortController();preparing=true;if(!mobile&&!adapter.prepareInSource?.())resultTab();render(); // Native location UI needs its source tab visible. Other scans reserve a results tab synchronously.
  try{if(adapter.requiresPin)$('panel').hidden=true;await DealScoutCore.deadline(signal=>adapter.prepare?.(signal),prepController.signal,12000,'Delivery session setup');if(token!==epoch)return;if(adapter.requiresPin)$('locationpin').value=adapter.getPin();if(token!==epoch)return;preparing=false;if(adapter.requiresPin)$('panel').hidden=false;if(!mobile&&!active)resultTab();message=mobile||active?'':'Click Open results if your browser blocked it.';await runner.start(queue,{budget:mode==='sample'?12000:0});if(mobile&&token===epoch){message=runner.items.length?'Tap View results to open your deals in a new tab.':'';render();}}catch(e){if(token===epoch){preparing=false;phaseError=true;message=e.message;render();}}finally{if(token===epoch&&adapter.requiresPin)$('panel').hidden=false;}
 }
 $('scan').onclick=()=>start('sample');$('quick').onclick=()=>start('categories');$('custom').onclick=()=>start('custom');$('reset').onclick=reset;$('view').onclick=()=>{message='';resultTab();render();};$('stop').onclick=stopNow;
 $('all').onclick=()=>{root.querySelectorAll('#cats input').forEach(c=>c.checked=true);render();};$('none').onclick=()=>{root.querySelectorAll('#cats input').forEach(c=>c.checked=false);render();};$('min').onclick=()=>$('panel').hidden=true;$('launcher').onclick=()=>$('panel').hidden=!$('panel').hidden;
 const timer=setInterval(()=>{if(!host.isConnected){runner.stop();clearInterval(timer);return;}if(active?.win.closed){active=null;reset();}else if(runner.state.status==='running'||preparing)render();},700);
 DealScoutCore.deadline(signal=>adapter.categories(signal),undefined,12000,'Category loading').then(list=>{groups=list;$('cats').replaceChildren();for(const g of groups){const label=node(document,'label'),check=node(document,'input');check.type='checkbox';check.value=g.id;check.checked=true;check.onchange=render;label.append(check,document.createTextNode(g.name));$('cats').append(label);}render();}).catch(e=>{message='Category list unavailable: '+e.message;phaseError=true;render();});
}

const PLATFORM_ADAPTER="amazon-now";
/* Per-platform read-only adapters. PLATFORM_ADAPTER is replaced at build time. */
function scoutKeywords(name) {
  const table=[[/fruit|vegetable/i,['fruit','vegetables']],[/dairy|milk|bread|egg/i,['milk','paneer','cheese','bread']],[/atta|grain|rice|staple|dal|oil|ghee|masala|dry fruit/i,['atta','rice','dal','ghee','oil','masala','dry fruits']],[/snack|munch|biscuit|packaged/i,['snacks','biscuits','noodles']],[/sweet|chocol|ice cream/i,['sweets','chocolate','ice cream']],[/tea|coffee|beverage|drink|juice/i,['tea','coffee','juice','diet coke','soft drinks','soda','water']],[/breakfast|sauce|spread/i,['oats','muesli','peanut butter']],[/protein|nutrition|health/i,['protein','whey']],[/beauty|personal|skin|hair|bath|hygiene/i,['skincare','haircare','oral care']],[/clean|detergent|laundry|household/i,['detergent','cleaning']],[/electronic|mobile|appliance/i,['headphones','charger','air fryer']],[/kitchen|home/i,['kitchen','cookware']],[/baby/i,['diapers','baby food']],[/pet/i,['pet food']]];
  return [...new Set(table.filter(([re])=>re.test(name)).flatMap(([,words])=>words))].length?[...new Set(table.filter(([re])=>re.test(name)).flatMap(([,words])=>words))]:[name];
}
const blinkitPace=DealScoutCore.pacer(500);
const SCOUT_ADAPTERS = {
  'jiomart-quick':()=>{
    const read=k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return localStorage.getItem(k);}};
    const native=()=>MarketplaceCore.jioContext({pin:read('pin'),geo:read('jio_lat_long'),stores:read('jio_qc_stores'),journey:read('journey')});
    let selected=null;
    const context=()=>{try{return JSON.stringify(native());}catch{return 'unavailable';}};
    async function listing(t,signal,page=1){const c=selected||native();const url=new URL('/ext/vertex/application/api/v1.0/products',location.origin);let filter='journey:quickcommerce:::store_ids:'+c.ids.join('||');if(t.facet)filter+=':::'+t.facet+':'+t.value;url.search=new URLSearchParams({f:filter,page_size:'50',sort_on:'discount_dsc',page_no:String(page),page_type:'number',...(t.keyword?{q:t.name}:{})});const res=await fetch(url,{signal,credentials:'include',headers:{accept:'application/json','x-location-detail':JSON.stringify(c.pin),'x-geolocation':JSON.stringify(c.geo)}});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(!Array.isArray(data.items)||!data.page)throw Error('JioMart Quick returned no recognizable listing.');return data;}
    return {name:'JioMart Quick',hosts:['jiomart.com'],delay:400,context,previewTasks:(groups,selected)=>DealScoutCore.tasks(groups,selected).map(t=>({...t,pageLimit:1})),
      async prepare(){selected=native();const header=document.querySelector('header')||document.querySelector('[role=banner]');if(header&&!header.textContent.includes(selected.pin.pincode))throw Error('JioMart location changed. Refresh Quick and select your address before scanning.');},
      async categories(signal){const c=native();const data=await listing({},signal);const departments=data.filters?.find(f=>f.key?.name==='department')?.values||[];const categories=data.filters?.find(f=>f.key?.name==='l1_category')?.values||[];const groups=categories.map(v=>({id:'l1:'+v.value,name:v.display,keywords:scoutKeywords(v.display),tasks:[{name:v.display,facet:'l1_category',value:v.value}]}));for(const d of departments.filter(d=>d.value!=='groceries'))groups.push({id:'department:'+d.value,name:d.display,keywords:scoutKeywords(d.display),tasks:[{name:d.display,facet:'department',value:d.value}]});if(!groups.length)throw Error('No Quick category facets returned. Open Quick and select your address first.');return groups;},
      async request(t,signal,emit,pages){const seen=new Set();let more=false;for(let page=1;page<=pages;page++){signal.throwIfAborted();emit([],`Page ${page}`);const data=await listing(t,signal,page);const items=data.items.map(MarketplaceCore.jioProduct).filter(Boolean);let added=0;for(const p of items){if(!seen.has(p.id)){seen.add(p.id);added++;}}emit(items.map(p=>({...p,parentCategory:t.category})),`Fetched page ${page}`,true);more=data.page.has_next===true;if(!more)return {truncated:false};if(!added)return {truncated:true,reason:'JioMart repeated a page or returned only unresolved price ranges.'};if(page<pages)await new Promise(r=>setTimeout(r,650));}return {truncated:more};}
    };
  },
  'flipkart-minutes':()=>{
    let selected=MinutesCore.selectedPin(),manual=false,autoLocate=true;
    return {prepareInSource:()=>autoLocate&&!MinutesCore.selectedPin(),autoLocateLabel:'Use current location if no address is selected',setAutoLocate:value=>autoLocate=value,name:'Flipkart Minutes',hosts:['flipkart.com'],delay:400,requiresPin:true,quickLabel:'⚡ Quick Keyword Deals · sampled categories',useCurrentLocation:async(signal)=>{await MinutesCore.useCurrentLocation(signal);selected=MinutesCore.selectedPin();manual=false;},quickHint:'Quick scans search the included category keywords; results are labelled as search buckets. Native category pages may ask you to confirm your delivery location.',getPin:()=>selected||'',setPin:value=>{selected=/^\d{6}$/.test(value)?value:null;manual=!!selected;},context:()=>[selected,MinutesCore.selectedPin()||'',MinutesCore.addressLabel?.()||'',location.href||''].join('|'),
      quickTasks(groups,selectedGroups){return groups.filter(g=>selectedGroups.has(g.id)).flatMap(g=>[...new Set(g.tasks.map(t=>t.subcategory||g.name).concat(/Cold Drinks/i.test(g.name)?['diet coke','coca cola zero']:[]))].map(name=>({name,keyword:true,category:'Search bucket · '+g.name,pageLimit:2})));},
      async prepare(signal){if(MinutesCore.isLocationUpdating?.())throw Error('Flipkart is updating your selected address. Wait for its delivery address to finish loading, then retry.');if(!MinutesCore.selectedPin()&&autoLocate&&MinutesCore.useCurrentLocation)await MinutesCore.useCurrentLocation(signal);const native=MinutesCore.selectedPin();if(manual&&native&&native!==selected)throw Error('The entered PIN differs from Flipkart’s selected PIN. Select your address again and correct the PIN.');if(!manual)selected=native;if(!selected)throw Error('Flipkart’s selected address PIN could not be read. Reopen its address selector, or enter the PIN shown for that selected address.');},
      async categories(){return CATEGORY_TREE.filter(c=>!c.id.includes('Price_Errors')).map(c=>({id:c.id,name:c.group||c.name,keywords:scoutKeywords(c.group||c.name),tasks:(c.subs?.length?c.subs:[c]).map(sub=>({name:(c.group||c.name)+' / '+sub.name,uri:sub.uri,subcategory:sub.name}))}));},
      async request(t,signal,emit,pages){let lastMore=false;const seen=new Set();
        for(let page=1;page<=pages;page++){
          signal.throwIfAborted();const uri=new URL(t.keyword?'/search':t.uri,location.origin);uri.searchParams.set('marketplace','HYPERLOCAL');uri.searchParams.set('sort','discount');uri.searchParams.set('page',page);if(t.keyword){uri.searchParams.set('q',t.name);uri.searchParams.set('as-show','off');uri.searchParams.set('as','off');}
          emit([],`Page ${page}`);const res=await fetch('https://1.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false',{method:'POST',signal,dealScoutRequest:true,credentials:'include',headers:{accept:'*/*','content-type':'application/json',flipkart_secure:'true','x-user-agent':navigator.userAgent+' FKUA/msite/0.0.4/msite/Mobile'},body:JSON.stringify({pageUri:uri.pathname+uri.search,requestContext:{type:'BROWSE_PAGE'},locationContext:{pincode:Number(selected),changed:false},pageContext:{trackingContext:{context:{eVar51:'direct_browse',eVar61:'direct_browse'}},fetchSeoData:true,networkSpeed:9250}})});
          if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(!data.RESPONSE||data.STATUS_CODE>=400)throw Error('Flipkart Minutes did not return a usable listing.');
          if(data.RESPONSE.pageMeta?.redirectionObject)throw Error('Flipkart requests address/serviceability confirmation. Open the native Minutes category first.');
          const items=MinutesCore.parse(data);let added=0;for(const p of items){if(!seen.has(p.id)){seen.add(p.id);added++;}}
          emit(items.map(p=>({...p,parentCategory:t.category,category:t.subcategory||t.category,subcategory:t.subcategory||'',stock:'Minutes listing; confirm delivery in the original shopping tab'})),`Fetched page ${page}`,true);
          const hasMore=data.RESPONSE.pageData?.hasMorePages;
          if(!items.length||!added)return {truncated:hasMore!==false,reason:'Flipkart repeated or emptied a page, so more products may be available.'};
          if(hasMore===false)return {truncated:false};lastMore=true;if(page<pages)await new Promise(r=>setTimeout(r,1000));
        }return {truncated:lastMore,reason:'Flipkart Minutes reached your chosen search limit. More products may be available.'};
      }
    };
  },
  zepto:()=>({
    name:'Zepto',hosts:['zepto.com'],concurrency:2,delay:150,idleTimeout:18000,context:()=>{const s=ZeptoSessionCore.selected(getCookie,localStorage);return [s.storeId,s.latitude,s.longitude].join('|');},
    async prepare(){extractLocationFromEnv();const store=findStoreId();if(capturedHeaders&&(capturedHeaders.store_id||capturedHeaders.storeid)!==store)capturedHeaders=null;if(!store||!capturedLocation)throw Error('Zepto delivery context is unavailable. Reopen its address selector and confirm your selected address.');await ensureSessionAtStart(()=>{});},
    async categories(signal){
      const cats=new Map((await getCategories(true,signal)).filter(c=>!c.isSpecial).map(c=>[c.categoryId,c]));
      // The grocery layout omits non-grocery departments. Merge actual category links.
      for(const a of document.querySelectorAll('a[href*="/cid/"]')){
        const m=new URL(a.href).pathname.match(/^\/cn\/([^/]+)\/[^/]+\/cid\/([^/]+)\/scid\/([^/]+)/);
        if(m&&!cats.has(m[2]))cats.set(m[2],{name:m[1].split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),categoryId:m[2],subCategoryId:m[3]});
      }
      return [...cats.values()].map(c=>({id:c.categoryId,name:c.name,keywords:scoutKeywords(c.name),tasks:[{name:c.name,cat:c}]}));
    },
    async request(t,signal,emit,pages){
      let truncated=false;
      const convert=p=>({id:p.id,name:p.name,pack:p.packSize,price:p.price,mrp:p.mrp,image:p.image||p.imageUrl,url:p.url,brand:p.brand,category:t.keyword?'':p.subcategory||t.category,parentCategory:t.category,subcategory:p.subcategory||'',soldOut:p.isOutOfStock,stock:p.isOutOfStock?'Out of stock':'Listed; confirm delivery on product page'});
      if(t.keyword){
        for(let page=0;page<pages;page++){
          signal.throwIfAborted();emit([],`Searching “${t.name}” · page ${page+1}`);
          const data=await searchBff(t.name,page,{signal});
          const widgets=Array.isArray(data.layout)?[...data.layout]:data.pageLayout?.widgets||data.layout?.widgets||data.widgets;
          const direct=data.data?.items||data.items||data.data?.products;
          if(!Array.isArray(widgets)&&!Array.isArray(direct))throw Error('Search response has no recognized product layout.');
          const layout=[...(widgets||[])];if(direct)layout.push({data:{items:direct}});
          const products=extractProductsFromWidgets(layout,{name:'Search'},{title:t.name},false);
          emit(products.map(convert),`Fetched page ${page+1}`,true);
          if(!products.length||data.endOfPage||data.hasReachedEnd||data.pageLayout?.endOfPage||data.data?.endOfPage)return {truncated:false};
          truncated=true;
          if(page+1<pages)await new Promise(r=>setTimeout(r,650));
        }
      }else{
        if(!capturedLocation?.latitude||!capturedLocation?.longitude)throw Error('Selected Zepto coordinates unavailable. Open a normal category page and retry.');
        const subs=await getSubcategories(t.cat,true);if(!subs.length)throw Error('No live subcategory list returned. Category remains unchecked.');
        for(let i=0;i<subs.length;i++){
          signal.throwIfAborted();const emitPage=(batch,detail)=>emit(batch.map(convert),`${i+1}/${subs.length} categories · ${detail}`,true);
          const result=await getDeals(t.cat,subs[i],detail=>emit([],`${i+1}/${subs.length} categories · ${detail}`),pages,signal,emitPage);truncated=truncated||result.truncated;
        }
      }return {truncated};
    }
  }),
  blinkit:()=>({
    name:'Blinkit',hosts:['blinkit.com'],concurrency:2,delay:0,idleTimeout:20000,context:()=>{const c=getDynamicContext();return c.lat+','+c.lon+'|'+c.chainId;},
    async prepare(){CTX=getDynamicContext();if(!CTX.detected)throw Error('Select your delivery address on Blinkit first.');fullSearchCache.clear();megaScoutCache.clear();catDealsCache.clear();},
    async categories(){return TAXONOMY.map(c=>({id:c.uuid,name:c.name,keywords:scoutKeywords(c.name),tasks:[...c.groupings.map(sub=>({name:c.name+' / '+sub.name,cat:c,sub})),...(/Drinks & Juices/i.test(c.name)?[{name:c.name+' / beverage search cross-check',supplemental:true,queries:['diet coke','coca cola zero','pepsi','soft drinks','soda','energy drink','coconut water']}]:[])]}));},
    async request(t,signal,emit,pages){
      if(t.supplemental){let truncated=false;for(const query of t.queries){signal.throwIfAborted();const result=await SCOUT_ADAPTERS.blinkit().request({...t,name:query,keyword:true,supplemental:false},signal,(batch,detail,page)=>emit(batch.filter(p=>/\b(soft drink|carbonated beverage|soda|juice|coconut water|energy drink|sparkling water)\b/i.test(p.name)&&!/\b(candy|toffee|chips|biscuit|gummy|syrup|powder)\b/i.test(p.name)).map(p=>({...p,category:p.category||'Beverage search supplement',discovery:'Search cross-check; beverage title matched'})),query+' · '+detail,page),Math.min(pages,5));truncated=truncated||result.truncated;}return {truncated};}
      let nextUrl=null;const seenCursors=new Set();let more=false;
      for(let page=0;page<pages;page++){
        signal.throwIfAborted();emit([],`Page ${page+1}`);
        const params=t.keyword?{q:t.name,query:t.name,search_query:t.name,search_type:'type_to_search'}:{collection_uuid:t.cat.uuid,collection_group_id:String(t.sub.id),collection_filters:'[]',collection_properties:JSON.stringify([{id:4179,name:'NEXT_PRODUCT_RECOMMENDATION',value:'true'}]),exclude_combos:'false',last_snippet_type:'product_card_snippet_type_2',last_widget_type:'product_container'};
        const body={...params,page_index:String(page),offset:String(page*15),limit:'15',oos_visibility:'true',sort:'discount_desc',products:'[]',total_entities_processed:String(page*15),total_pagination_items:'15',applied_filters:null};
        const url=new URL(nextUrl||(t.keyword?'/v1/layout/search':'/v1/layout/listing_widgets'),location.origin);
        if(url.origin!==location.origin||!['/v1/layout/search','/v1/layout/listing_widgets'].includes(url.pathname))throw Error('Unexpected continuation URL.');
        if(nextUrl){for(const [k,v] of url.searchParams)body[k]=v;}
        else{for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);url.searchParams.set('page_index',page);url.searchParams.set('offset',page*15);url.searchParams.set('sort','discount_desc');}
        await blinkitPace(signal);signal.throwIfAborted();const res=await fetch(url,{method:'POST',signal,headers:{'content-type':'application/json',app_client:'consumer_web',lat:CTX.lat,lon:CTX.lon},body:JSON.stringify(body)});
        if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();
        if(!data||typeof data!=='object')throw Error('Unrecognized listing response');
        const items=parseItems(data);emit(items.map(p=>({id:p.productId,name:p.name,pack:p.variant,brand:p.brand,price:p.price,mrp:p.mrp,image:p.image,category:p.category||t.sub?.name||'',parentCategory:t.category,subcategory:t.sub?.name||'',url:'https://blinkit.com/prn/'+encodeURIComponent(p.name.toLowerCase().replaceAll(' ','-'))+'/prid/'+p.productId,soldOut:p.soldOut,stock:p.soldOut?'Out of stock':'Listed; confirm delivery on product page'})),`Fetched page ${page+1}`,true);
        nextUrl=data.response?.pagination?.next_url||data.pagination?.next_url||null;more=!!nextUrl;
        if(!more)return {truncated:false};
        if(seenCursors.has(nextUrl))return {truncated:true,reason:'The store repeated a page, so more products may be available.'};
        seenCursors.add(nextUrl);if(page+1<pages)await new Promise(r=>setTimeout(r,200));
      }
      return {truncated:more};
    }
  }),
  'amazon-now':()=>({
    name:'Amazon Now',hosts:['amazon.in'],delay:400,
    context:()=>[detectBrandId(),document.querySelector('#glow-ingress-line2')?.textContent?.trim()||''].join('|'),
    async prepare(){sessionStorage.removeItem('__aznowBrandId');brandId=detectBrandId();if(!brandId)throw Error('Open Amazon Now, select your delivery address and a category, then run this bookmark again.');},
    async categories(){return categoriesData.map(c=>({id:c.name,name:c.name,keywords:scoutKeywords(c.name),tasks:c.subs.map(s=>({name:c.name+' / '+s[0],node:s[1],subcategory:s[0]}))}));},
    async request(t,signal,emit,pages){
      let offset=0,more=false;const offsets=new Set();
      for(let page=0;page<pages;page++){
        signal.throwIfAborted();emit([],`Page ${page+1}`);
        const res=await fetch(t.keyword?buildKeywordRawSearchUrl(t.name,page+1,'pct-off-with-tax'):buildCategoryUrl(t.node,offset),{credentials:'include',signal});
        if(!res.ok)throw Error('HTTP '+res.status);let products;
        if(t.keyword){const text=await res.text();const doc=new DOMParser().parseFromString(text,'text/html');if(/captcha|validateCaptcha|Robot Check/i.test(doc.title+' '+text.slice(0,3000)))throw Error('HTTP 403: Amazon verification required.');const parsed=parseHtmlSearchPage(text);if(!parsed.totalCards&&!/No results for|did not match any products/i.test(text))throw Error('No recognizable Amazon Now search results.');products=parsed.items;more=hasNextSearchPage(doc,page+2,parsed.totalCards);}
        else{const data=await res.json();if(!Array.isArray(data.data?.widgets))throw Error('No Amazon Now category widgets returned.');products=data.data.widgets.flatMap(w=>(w.data?.products||[]).map(p=>parseProduct(p,t.category))).filter(Boolean);more=data.data.metadata?.hasMoreWidgets!==false;const next=data.data.metadata?.nextOffset;offset=typeof next==='number'?next:offset+1;}
        emit(products.map(p=>({id:p.a,name:p.t,pack:p.pz,brand:p.b,price:p.bp,mrp:p.lp,image:p.img,parentCategory:t.category,category:t.keyword?p.c?.[0]:t.subcategory||t.category,subcategory:t.subcategory||'',url:'https://www.amazon.in/dp/'+p.a+'?almBrandId='+encodeURIComponent(brandId),stock:'Price listed; delivery/stock must be confirmed'})),`Fetched page ${page+1}`,true);
        if(!more)return {truncated:false};if(!products.length)return {truncated:more,reason:'Amazon returned an empty page, so more products may be available.'};
        if(!t.keyword&&offsets.has(offset))return {truncated:true,reason:'Amazon repeated its continuation offset.'};offsets.add(offset);if(page+1<pages)await new Promise(r=>setTimeout(r,1000));
      }
      return {truncated:more};
    }
  }),
  bigbasket:()=>({
    name:'BigBasket',hosts:['bigbasket.com'],delay:250,
    context:()=>[...document.querySelectorAll('header button')].find(b=>/delivery in|select location/i.test(b.textContent))?.textContent?.trim()||'',
    async prepare(){if(/access denied|request blocked/i.test((document.title||'')+' '+(document.body?.innerText||'').slice(0,250)))throw Error('BigBasket refused website access. Open its normal site and complete its verification before scanning.');if(!/bigbasket\.com$/.test(location.hostname)||![...document.querySelectorAll('header button')].some(b=>/delivery in/i.test(b.textContent)))throw Error('Open BigBasket and select a delivery address first.');},
    async categories(){
      const names=[['Fruits & Vegetables','fruits-vegetables'],['Foodgrains, Oil & Masala','foodgrains-oil-masala'],['Bakery, Cakes & Dairy','bakery-cakes-dairy'],['Beverages','beverages'],['Snacks & Branded Foods','snacks-branded-foods'],['Beauty & Hygiene','beauty-hygiene'],['Cleaning & Household','cleaning-household'],['Kitchen, Garden & Pets','kitchen-garden-pets'],['Eggs, Meat & Fish','eggs-meat-fish'],['Gourmet & World Food','gourmet-world-food'],['Baby Care','baby-care']];
      const cats=new Map(names.map(([name,id])=>[id,{name,id}]));
      for(const a of document.querySelectorAll('a[href*="/cl/"]')){const match=new URL(a.href).pathname.match(/^\/cl\/([^/]+)\/?$/);const name=a.textContent.trim();if(match&&name)cats.set(match[1],{id:match[1],name});}
      return [...cats.values()].map(c=>({...c,keywords:scoutKeywords(c.name),tasks:[{name:c.name,slug:c.id}]}));
    },
    async request(t,signal,emit,pages){
      let more=false;
      for(let page=1;page<=pages;page++){
        signal.throwIfAborted();emit([],`Page ${page}`);
        const url=new URL('/listing-svc/v2/products',location.origin);url.search=new URLSearchParams(t.keyword?{type:'ps',slug:t.name,page,sort:'dphtl'}:{type:'pc',slug:t.slug,page,sort:'dphtl'});
        const res=await fetch(url,{signal,credentials:'include',headers:{accept:'application/json','x-channel':'BB-WEB','x-entry-context':'bb-b2c','x-entry-context-id':'100'}});
        if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();
        const info=data.product_info||data.tabs?.find(t=>Array.isArray(t.product_info?.products))?.product_info;
        const raw=info?.products||data.products;if(!Array.isArray(raw))throw Error('No recognizable BigBasket product listing.');
        const all=raw.flatMap(p=>[p,...(p.children||[])]);
        emit(all.map(p=>({id:String(p.id||''),name:p.desc||p.p_desc||p.name,pack:p.w||p.pack_desc,price:Number(p.pricing?.discount?.prim_price?.sp||p.pricing?.offer_price||p.pricing?.sp||p.sp),mrp:Number(p.pricing?.discount?.mrp||p.pricing?.mrp||p.mrp),image:p.images?.[0]?.s||p.images?.[0]?.m,category:!t.keyword?t.category:'',parentCategory:t.category,brand:p.brand?.name||p.p_brand,url:p.absolute_url?new URL(p.absolute_url,location.origin).href:'https://www.bigbasket.com/pd/'+p.id,soldOut:p.availability?.is_available===false||['000','002'].includes(p.availability?.avail_status)||['OUT_OF_STOCK','NOT_AVAILABLE','COMING_SOON'].includes(p.availability?.button_state),stock:p.availability?.is_available===true?'Listed as available; confirm selected address':'Availability unverified; open product'})),`Fetched page ${page}`,true);
        more=MarketplaceCore.bbMore(info,raw.length);if(!raw.length)return {truncated:more,reason:'Empty BigBasket page without a verified end.'};if(!more)return {truncated:false};if(page<pages)await new Promise(r=>setTimeout(r,650));
      }return {truncated:more};
    }
  })
};
mountDealScout(SCOUT_ADAPTERS[PLATFORM_ADAPTER]());

})();
