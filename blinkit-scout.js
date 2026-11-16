/*
MIT License

Copyright (c) 2026 Jairaj Munirathnam (https://github.com/jairaj26)

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
(function(){
if(!(location.hostname==="blinkit.com"||location.hostname.endsWith('.'+"blinkit.com"))){alert('Open Blinkit and select your delivery address first.');return;}
if(document.getElementById('quick-deal-scout-v4-4')){document.getElementById('quick-deal-scout-v4-4').shadowRoot.getElementById('panel').hidden=false;return;}
if(document.getElementById('quick-deal-scout-v4-3')||document.getElementById('quick-deal-scout-v4-2')||document.getElementById('quick-deal-scout-v4-1')||document.getElementById('quick-deal-scout-v4')||document.getElementById('quick-deal-scout-v3')||document.getElementById('quick-deal-scout-v2')){alert('Reload this shopping tab once before running Scout v4.4. Previous results stay open.');return;}

"use strict";
  // ---------- Context (100% Dynamic Location from Blinkit) ----------
  const cookie = (n) => {
    const m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
    if (!m) return "";
    try { return decodeURIComponent(m[1]); } catch { return m[1]; }
  };

  const getDynamicContext = () => {
    const pre = (window.grofers && window.grofers.PRELOADED_STATE && window.grofers.PRELOADED_STATE.data) || {};
    const loc = pre.location || {};
    const preCoords = loc.coords || {};

    let storageCoords = {}, storageLocality = "";
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && /location|address|coords|user_loc/i.test(k)) {
          try {
            const val = JSON.parse(localStorage.getItem(k));
            if (val && typeof val === "object") {
              if (val.lat && val.lon) storageCoords = val;
              else if (val.coords && val.coords.lat) storageCoords = val.coords;
              const candLoc = val.display_address || val.name || val.locality || val.cityName || val.area;
              if (candLoc && typeof candLoc === "string" && !/^\d+$/.test(candLoc.trim())) {
                storageLocality = candLoc.trim();
              }
            }
          } catch (_) {}
        }
      }
    } catch (_) {}

    const lat = preCoords.lat || cookie("gr_1_lat") || storageCoords.lat || "";
    const lon = preCoords.lon || cookie("gr_1_lon") || storageCoords.lon || "";

    // City ID numbers (like '3' for Bangalore) must be rejected
    const isValidLocality = (str) => {
      if (!str || typeof str !== "string") return false;
      const s = str.trim();
      return s.length >= 2 && !/^\d+$/.test(s);
    };

    const candidates = [
      loc.display_address,
      loc.name,
      loc.locality_name,
      loc.area_name,
      loc.cityName,
      loc.city_name,
      loc.locality,
      cookie("gr_1_display_address"),
      cookie("gr_1_locality_name"),
      cookie("gr_1_city_name"),
      storageLocality,
    ];

    let locality = "";
    for (const cand of candidates) {
      if (isValidLocality(cand)) {
        locality = cand.trim();
        break;
      }
    }

    if (!locality) {
      try {
        const domEl = document.querySelector('header [class*="location"], [class*="LocationBar"], [class*="location-box"]');
        if (domEl && isValidLocality(domEl.textContent)) {
          locality = domEl.textContent.trim().split("\n")[0].slice(0, 30);
        }
      } catch (_) {}
    }

    const chainId = String(pre.chainId || cookie("gr_1_chain_id") || "").trim();

    return {
      lat: String(lat || ""),
      lon: String(lon || ""),
      locality: locality || (lat && lon ? (chainId ? "Store " + chainId : "Selected Location") : "Location not set"),
      chainId: chainId,
      detected: !!(lat && lon),
    };
  };

  let CTX = getDynamicContext();

  const TAXONOMY = [
  {
    "name": "Baby Care",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMzk=",
    "groupings": [
      {
        "id": 46757,
        "name": "Diaper & Wipes"
      },
      {
        "id": 20667,
        "name": "Baby Food"
      },
      {
        "id": 11683,
        "name": "Baby Shampoo & Soaps"
      },
      {
        "id": 11682,
        "name": "Skin & Hair Care"
      },
      {
        "id": 11686,
        "name": "Feeding Essentials"
      },
      {
        "id": 46758,
        "name": "Clothes & Accessories"
      },
      {
        "id": 11687,
        "name": "Health &  Hygiene"
      },
      {
        "id": 11688,
        "name": "Baby Oral Care"
      },
      {
        "id": 11689,
        "name": "Baby Toys & Gifts"
      },
      {
        "id": 628097,
        "name": "Baby Gear"
      },
      {
        "id": 814811,
        "name": "Mom Care Needs"
      }
    ]
  },
  {
    "name": "Bath & Body",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDY=",
    "groupings": [
      {
        "id": 679509,
        "name": "Bathing Soaps"
      },
      {
        "id": 723321,
        "name": "Shower Gels & Scrubs"
      },
      {
        "id": 11650,
        "name": "Oral Care"
      },
      {
        "id": 11658,
        "name": "Handwash"
      },
      {
        "id": 174026,
        "name": "Fragrance & Talc"
      },
      {
        "id": 12739,
        "name": "Bath Accessories"
      },
      {
        "id": 12011,
        "name": "Shampoo"
      },
      {
        "id": 12012,
        "name": "Conditioner"
      },
      {
        "id": 209068,
        "name": "Face Cleaning"
      },
      {
        "id": 209073,
        "name": "Body Lotions & Oils"
      },
      {
        "id": 887335,
        "name": "Body Treatment & Roll On"
      },
      {
        "id": 18689,
        "name": "Bath & Beauty Gifts"
      }
    ]
  },
  {
    "name": "Beauty & Cosmetics",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDE=",
    "groupings": [
      {
        "id": 11672,
        "name": "Lipstick & Gloss "
      },
      {
        "id": 11671,
        "name": "Cleansers & Toners"
      },
      {
        "id": 11675,
        "name": "Foundation & Compact"
      },
      {
        "id": 22980,
        "name": "Blush & Highlighter"
      },
      {
        "id": 11676,
        "name": "Primer & Concealer"
      },
      {
        "id": 11673,
        "name": "Kajal & Eyeliners"
      },
      {
        "id": 11911,
        "name": "Bindi, Bangles & Others"
      },
      {
        "id": 11674,
        "name": "Nail Paints & Accessories"
      },
      {
        "id": 13642,
        "name": "Beauty Accessories"
      },
      {
        "id": 628082,
        "name": "Bath & Beauty Gifts"
      },
      {
        "id": 128500,
        "name": "Beauty E-Card"
      }
    ]
  },
  {
    "name": "Feminine Hygiene",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDA=",
    "groupings": [
      {
        "id": 12237,
        "name": "Sanitary Pads"
      },
      {
        "id": 11677,
        "name": "Tampons & Menstrual Cups"
      },
      {
        "id": 12238,
        "name": "Period Panty"
      },
      {
        "id": 11680,
        "name": "Period Pain Relief"
      },
      {
        "id": 11678,
        "name": "Intimate Wash & Wipes"
      },
      {
        "id": 12239,
        "name": "Hair Removal"
      },
      {
        "id": 11679,
        "name": "Mom Care"
      }
    ]
  },
  {
    "name": "Hair",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDU=",
    "groupings": [
      {
        "id": 12014,
        "name": "Shampoo"
      },
      {
        "id": 12015,
        "name": "Conditioner"
      },
      {
        "id": 135472,
        "name": "Hair Colour"
      },
      {
        "id": 12016,
        "name": "Hair Colour"
      },
      {
        "id": 11659,
        "name": "Hair Oil & Cream"
      },
      {
        "id": 135473,
        "name": "Hair Serums"
      },
      {
        "id": 11660,
        "name": "Hair Serum"
      },
      {
        "id": 11661,
        "name": "Hair Styling"
      },
      {
        "id": 12018,
        "name": "Appliances"
      },
      {
        "id": 11662,
        "name": "Hair Accessories"
      }
    ]
  },
  {
    "name": "Health & Pharma",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMzI=",
    "groupings": [
      {
        "id": 532514,
        "name": "Fever & Pain Relief"
      },
      {
        "id": 556584,
        "name": "Cough, Cold & Flu"
      },
      {
        "id": 11698,
        "name": "Masks & Sanitizers"
      },
      {
        "id": 531928,
        "name": "Stomach & Digestive Care"
      },
      {
        "id": 11695,
        "name": "Protein Supplements"
      },
      {
        "id": 11694,
        "name": "Vitamins & Supplements"
      },
      {
        "id": 534592,
        "name": "Derma Medicines"
      },
      {
        "id": 534549,
        "name": "Bandaid & Wound Care"
      },
      {
        "id": 534595,
        "name": "Eye & Ear Care"
      },
      {
        "id": 11697,
        "name": "Adult Diapers"
      },
      {
        "id": 766707,
        "name": "Health & Ortho Supports"
      },
      {
        "id": 534594,
        "name": "Gynaecology Medicines"
      },
      {
        "id": 556595,
        "name": "Oral Care"
      },
      {
        "id": 534591,
        "name": "Diabetes Medicines"
      },
      {
        "id": 534587,
        "name": "Heart Medicines"
      },
      {
        "id": 534593,
        "name": "Neuro Medicines"
      },
      {
        "id": 627432,
        "name": "Hangover Cure"
      },
      {
        "id": 128505,
        "name": "Health & Wellness E-Cards"
      }
    ]
  },
  {
    "name": "Sexual Wellness",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMzA=",
    "groupings": [
      {
        "id": 12241,
        "name": "Massagers"
      },
      {
        "id": 12240,
        "name": "Condoms"
      },
      {
        "id": 11699,
        "name": "Lubricants"
      },
      {
        "id": 11748,
        "name": "Enhancers"
      },
      {
        "id": 63166,
        "name": "Adult Games"
      },
      {
        "id": 486692,
        "name": "Test Kits"
      },
      {
        "id": 557599,
        "name": "Medicines"
      }
    ]
  },
  {
    "name": "Skin & Face",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDI=",
    "groupings": [
      {
        "id": 12020,
        "name": "Sunscreen"
      },
      {
        "id": 204868,
        "name": "Face Cleaning"
      },
      {
        "id": 206263,
        "name": "Face Oil, Serum & Essence"
      },
      {
        "id": 204873,
        "name": "Face Moisturisers"
      },
      {
        "id": 204875,
        "name": "Body Lotions & Oils"
      },
      {
        "id": 204900,
        "name": "Lip & Eye Care"
      },
      {
        "id": 887330,
        "name": "Face Masks & Packs"
      },
      {
        "id": 887331,
        "name": "Toners & Mists"
      },
      {
        "id": 887332,
        "name": "Acne & Blackhead Fixers"
      },
      {
        "id": 204902,
        "name": "Men's Grooming"
      },
      {
        "id": 204891,
        "name": "Women's Grooming"
      }
    ]
  },
  {
    "name": "Atta, Rice & Dal",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNjk=",
    "groupings": [
      {
        "id": 16426,
        "name": "Atta"
      },
      {
        "id": 16431,
        "name": "Local Rice"
      },
      {
        "id": 41521,
        "name": "Rice"
      },
      {
        "id": 16423,
        "name": "Dal"
      },
      {
        "id": 16430,
        "name": "Besan, Sooji & Maida"
      },
      {
        "id": 16425,
        "name": "Rajma, Chhole & Others"
      },
      {
        "id": 874060,
        "name": "Millet & Other Flours"
      },
      {
        "id": 16427,
        "name": "Organic"
      },
      {
        "id": 31475,
        "name": "Poha, Daliya & Other Grains"
      },
      {
        "id": 885921,
        "name": "Summer Specials"
      }
    ]
  },
  {
    "name": "Bakery & Biscuits",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTQ=",
    "groupings": [
      {
        "id": 11527,
        "name": "Cookies"
      },
      {
        "id": 11528,
        "name": "Cream Biscuits"
      },
      {
        "id": 11530,
        "name": "Healthy & Digestive"
      },
      {
        "id": 11531,
        "name": "Sweet & Salty"
      },
      {
        "id": 12726,
        "name": "Glucose & Marie"
      },
      {
        "id": 12732,
        "name": "Rusks & Wafers"
      },
      {
        "id": 11529,
        "name": "Cakes & Rolls"
      },
      {
        "id": 11532,
        "name": "Baking Ingredients"
      },
      {
        "id": 11534,
        "name": "Gourmet Bakery"
      },
      {
        "id": 18679,
        "name": "Biscuit Gift Pack"
      }
    ]
  },
  {
    "name": "Chicken, Meat & Fish",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTI=",
    "groupings": [
      {
        "id": 11537,
        "name": "Chicken"
      },
      {
        "id": 24161,
        "name": "Fresh Meat"
      },
      {
        "id": 11540,
        "name": "Fish & Seafood"
      },
      {
        "id": 11543,
        "name": "Mutton"
      },
      {
        "id": 497533,
        "name": "Frozen Non-Veg Snacks"
      },
      {
        "id": 880650,
        "name": "Non Veg Spices"
      },
      {
        "id": 11538,
        "name": "Sausage, Salami & Ham"
      },
      {
        "id": 11541,
        "name": "Exotic Meat"
      },
      {
        "id": 900714,
        "name": "Fresh Marinades"
      },
      {
        "id": 11542,
        "name": "Plant Based Meat"
      },
      {
        "id": 11539,
        "name": "Eggs"
      }
    ]
  },
  {
    "name": "Dairy, Bread & Eggs",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTU=",
    "groupings": [
      {
        "id": 11591,
        "name": "Milk"
      },
      {
        "id": 11592,
        "name": "Bread & Pav"
      },
      {
        "id": 11595,
        "name": "Eggs"
      },
      {
        "id": 11593,
        "name": "Curd & Yogurt"
      },
      {
        "id": 17124,
        "name": "Cheese & Butter"
      },
      {
        "id": 109735,
        "name": "Batter"
      },
      {
        "id": 11596,
        "name": "Paneer & Tofu"
      },
      {
        "id": 183969,
        "name": "Soy Milk & More"
      },
      {
        "id": 11594,
        "name": "Lassi & Milkshakes"
      },
      {
        "id": 11598,
        "name": "Cream & Whitener"
      }
    ]
  },
  {
    "name": "Dry Fruits & Cereals",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTM=",
    "groupings": [
      {
        "id": 11599,
        "name": "Dry Fruits"
      },
      {
        "id": 11600,
        "name": "Dry Fruits Snacks"
      },
      {
        "id": 11601,
        "name": "Corn Flakes & Kids Cereals"
      },
      {
        "id": 11602,
        "name": "Muesli & Granola"
      },
      {
        "id": 11603,
        "name": "Oats & Daliya"
      },
      {
        "id": 892781,
        "name": "Dates"
      },
      {
        "id": 892782,
        "name": "Seeds"
      },
      {
        "id": 11606,
        "name": "Vermicelli & Poha"
      },
      {
        "id": 11605,
        "name": "Organic & Premium"
      },
      {
        "id": 12734,
        "name": "Dry Fruit Gift Packs"
      }
    ]
  },
  {
    "name": "Kitchenware & Appliances",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTI5ODI=",
    "groupings": [
      {
        "id": 620088,
        "name": "Bottles & Flasks"
      },
      {
        "id": 659661,
        "name": "Kitchen Accessories"
      },
      {
        "id": 620090,
        "name": "Mugs & Glasses"
      },
      {
        "id": 620091,
        "name": "Cookware & Sets"
      },
      {
        "id": 620092,
        "name": "Storage & Containers"
      },
      {
        "id": 620093,
        "name": "Barware"
      },
      {
        "id": 620094,
        "name": "Lunch Boxes"
      },
      {
        "id": 620095,
        "name": "Cutting & Chopping"
      },
      {
        "id": 578042,
        "name": "Dining & Serveware"
      },
      {
        "id": 13653,
        "name": "Kitchen Appliances"
      },
      {
        "id": 13652,
        "name": "Tissues & Disposables"
      }
    ]
  },
  {
    "name": "Oil, Ghee & Masala",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTY=",
    "groupings": [
      {
        "id": 18687,
        "name": "Oil"
      },
      {
        "id": 11585,
        "name": "Desi Ghee"
      },
      {
        "id": 92942,
        "name": "Cow Ghee"
      },
      {
        "id": 16433,
        "name": "Powdered Spices"
      },
      {
        "id": 880385,
        "name": "Non Veg Spices"
      },
      {
        "id": 11582,
        "name": "Salt, Sugar & Jaggery"
      },
      {
        "id": 17743,
        "name": "Whole Spices"
      },
      {
        "id": 895753,
        "name": "Gravy Mixes & Pastes"
      },
      {
        "id": 16419,
        "name": "Herbs & Seasoning"
      },
      {
        "id": 11590,
        "name": "Organic"
      }
    ]
  },
  {
    "name": "Vegetables & Fruits",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNzE=",
    "groupings": [
      {
        "id": 90651,
        "name": "All"
      },
      {
        "id": 11370,
        "name": "Fresh Vegetables"
      },
      {
        "id": 11371,
        "name": "Fresh Fruits"
      },
      {
        "id": 11372,
        "name": "Exotics"
      },
      {
        "id": 11373,
        "name": "Coriander & Others"
      },
      {
        "id": 11374,
        "name": "Freshly Cut & Sprouts"
      },
      {
        "id": 11375,
        "name": "Trusted Organics"
      },
      {
        "id": 18664,
        "name": "Flowers & Leaves"
      },
      {
        "id": 16398,
        "name": "Seasonal"
      },
      {
        "id": 11376,
        "name": "Frozen Veg"
      },
      {
        "id": 11377,
        "name": "Hydroponic"
      }
    ]
  },
  {
    "name": "Cleaners & Repellents",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjc=",
    "groupings": [
      {
        "id": 11720,
        "name": "Repellents & Disinfectants"
      },
      {
        "id": 11711,
        "name": "Detergent Powder & Bars"
      },
      {
        "id": 82715,
        "name": "Liquid Detergents"
      },
      {
        "id": 11715,
        "name": "Laundry Additives"
      },
      {
        "id": 12759,
        "name": "Dishwashing Gels & Bars"
      },
      {
        "id": 12760,
        "name": "Dishwashing Accessories"
      },
      {
        "id": 11713,
        "name": "Toilet Cleaners"
      },
      {
        "id": 11714,
        "name": "Floor Cleaners"
      },
      {
        "id": 11716,
        "name": "Cleaning Tools"
      },
      {
        "id": 11718,
        "name": "Garbage Bags"
      },
      {
        "id": 11721,
        "name": "Glass, Metal Cleaners & Others"
      },
      {
        "id": 36577,
        "name": "Shoe Care"
      },
      {
        "id": 11722,
        "name": "Machine & Car Care"
      },
      {
        "id": 628094,
        "name": "Household Appliance Cleaners"
      }
    ]
  },
  {
    "name": "Electronics",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjY=",
    "groupings": [
      {
        "id": 11728,
        "name": "Trimmers & Hair Appliances"
      },
      {
        "id": 17702,
        "name": "Earphones & Headsets"
      },
      {
        "id": 12249,
        "name": "Speakers"
      },
      {
        "id": 11723,
        "name": "Mobile & Computer"
      },
      {
        "id": 11724,
        "name": "Decorative Lights"
      },
      {
        "id": 98396,
        "name": "Chargers & Cables"
      },
      {
        "id": 12250,
        "name": "Smart Watches"
      },
      {
        "id": 628148,
        "name": "Kitchen Appliances"
      },
      {
        "id": 349680,
        "name": "Laptop & Mobile Phones"
      },
      {
        "id": 12248,
        "name": "Batteries"
      },
      {
        "id": 11726,
        "name": "Extension Cables & Accessories"
      },
      {
        "id": 11727,
        "name": "Home Appliances"
      },
      {
        "id": 118329,
        "name": "Music Instruments & Accessories"
      },
      {
        "id": 128506,
        "name": "Electronics E-Card"
      }
    ]
  },
  {
    "name": "Home & Lifestyle",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjk=",
    "groupings": [
      {
        "id": 274585,
        "name": "Home Decor"
      },
      {
        "id": 11740,
        "name": "Plants & Bouquets"
      },
      {
        "id": 11705,
        "name": "Bedsheets & Towels"
      },
      {
        "id": 416530,
        "name": "Gardening"
      },
      {
        "id": 11710,
        "name": "Decorative Lights"
      },
      {
        "id": 11702,
        "name": "Home Needs"
      },
      {
        "id": 628253,
        "name": "Tissues & Disposables"
      },
      {
        "id": 131574,
        "name": "Jewellery"
      },
      {
        "id": 11703,
        "name": "Innerwear"
      },
      {
        "id": 11707,
        "name": "Lifestyle Accessories"
      },
      {
        "id": 659636,
        "name": "Party & Festive Needs"
      },
      {
        "id": 627704,
        "name": "Socks & Handkerchiefs"
      },
      {
        "id": 11709,
        "name": "Fresheners"
      },
      {
        "id": 21983,
        "name": "Pooja Needs"
      },
      {
        "id": 22864,
        "name": "Bathroom Essentials"
      },
      {
        "id": 22865,
        "name": "Bags"
      },
      {
        "id": 127889,
        "name": "E-Gift Cards"
      }
    ]
  },
  {
    "name": "Stationery & Games",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjU=",
    "groupings": [
      {
        "id": 627397,
        "name": "Notebooks & Diaries"
      },
      {
        "id": 627401,
        "name": "Pens & Pencils"
      },
      {
        "id": 12256,
        "name": "Toys & Games"
      },
      {
        "id": 11730,
        "name": "Glue & Tape"
      },
      {
        "id": 12254,
        "name": "Books & Magazines"
      },
      {
        "id": 12255,
        "name": "Bags & School Needs"
      },
      {
        "id": 714981,
        "name": "Children's Books"
      },
      {
        "id": 583269,
        "name": "Arts & Crafts"
      },
      {
        "id": 12257,
        "name": "Files & Office Needs"
      },
      {
        "id": 627415,
        "name": "Gift Wraps & Bags"
      },
      {
        "id": 11731,
        "name": "Sports & Gym"
      },
      {
        "id": 11729,
        "name": "Shoe Polish & Brush"
      }
    ]
  },
  {
    "name": "Chips & Namkeen",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNjg=",
    "groupings": [
      {
        "id": 11402,
        "name": "Chips & Wafers"
      },
      {
        "id": 11405,
        "name": "Bhujia & Mixtures"
      },
      {
        "id": 11404,
        "name": "Namkeen Snacks"
      },
      {
        "id": 11407,
        "name": "Nachos"
      },
      {
        "id": 11403,
        "name": "Healthy Snacks"
      },
      {
        "id": 11406,
        "name": "Popcorn"
      },
      {
        "id": 11408,
        "name": "Papad & Fryums"
      },
      {
        "id": 11410,
        "name": "Premium"
      },
      {
        "id": 11409,
        "name": "Gift Packs"
      }
    ]
  },
  {
    "name": "Drinks & Juices",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTE=",
    "groupings": [
      {
        "id": 11607,
        "name": "Soft Drinks"
      },
      {
        "id": 673755,
        "name": "Fruit Juices"
      },
      {
        "id": 885907,
        "name": "Zero Sugar Drinks"
      },
      {
        "id": 14471,
        "name": "Energy Drinks"
      },
      {
        "id": 304488,
        "name": "Hydration Drinks"
      },
      {
        "id": 11613,
        "name": "Soda & Mixers"
      },
      {
        "id": 11615,
        "name": "Water & Ice Cubes"
      },
      {
        "id": 18673,
        "name": "Mango Drinks"
      },
      {
        "id": 17133,
        "name": "Soy Milk & More"
      },
      {
        "id": 18675,
        "name": "Cold Coffee & Ice Tea"
      },
      {
        "id": 11616,
        "name": "Coconut Water"
      },
      {
        "id": 11609,
        "name": "Concentrates & Syrups"
      },
      {
        "id": 11750,
        "name": "Premium"
      },
      {
        "id": 18695,
        "name": "Beverages Gift Packs"
      }
    ]
  },
  {
    "name": "Ice Creams & More",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMxOTg=",
    "groupings": [
      {
        "id": 12770,
        "name": "Tubs"
      },
      {
        "id": 12768,
        "name": "Sticks"
      },
      {
        "id": 15719,
        "name": "Cones"
      },
      {
        "id": 12769,
        "name": "Cassata & Sandwich"
      },
      {
        "id": 12778,
        "name": "Single Serve Cups"
      },
      {
        "id": 806290,
        "name": "Cakes & Others"
      },
      {
        "id": 12779,
        "name": "Guilt-Free"
      },
      {
        "id": 12777,
        "name": "Gourmet"
      },
      {
        "id": 354853,
        "name": "Syrups"
      }
    ]
  },
  {
    "name": "Instant Food",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDk=",
    "groupings": [
      {
        "id": 11624,
        "name": "Noodles"
      },
      {
        "id": 11629,
        "name": "Frozen Veg Snacks"
      },
      {
        "id": 11626,
        "name": "Pasta"
      },
      {
        "id": 11625,
        "name": "Frozen Non-Veg Snacks"
      },
      {
        "id": 11628,
        "name": "Soup"
      },
      {
        "id": 11627,
        "name": "Ready to Eat"
      },
      {
        "id": 11630,
        "name": "Idli & Dosa Batter"
      },
      {
        "id": 11631,
        "name": "Dessert & Cake Mixes"
      },
      {
        "id": 11632,
        "name": "Organic & Premium"
      },
      {
        "id": 18693,
        "name": "Energy Bars"
      }
    ]
  },
  {
    "name": "Paan Corner",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDc=",
    "groupings": [
      {
        "id": 15119,
        "name": "Cigarettes"
      },
      {
        "id": 383144,
        "name": "Lighters"
      },
      {
        "id": 62439,
        "name": "Cigar"
      },
      {
        "id": 11644,
        "name": "Rolling Needs"
      },
      {
        "id": 744872,
        "name": "Hookah Needs"
      },
      {
        "id": 127956,
        "name": "Rolling Tobacco"
      },
      {
        "id": 127957,
        "name": "Paan Masala"
      },
      {
        "id": 438175,
        "name": "Ashtrays"
      },
      {
        "id": 11649,
        "name": "Mouth Fresheners & Gums"
      },
      {
        "id": 389984,
        "name": "Non-Tobacco Blends"
      },
      {
        "id": 15725,
        "name": "Smoking Cessation"
      }
    ]
  },
  {
    "name": "Sauces & Spreads",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDg=",
    "groupings": [
      {
        "id": 11643,
        "name": "Tomato Ketchup"
      },
      {
        "id": 11636,
        "name": "Jam & Spreads"
      },
      {
        "id": 11641,
        "name": "Mayonnaise"
      },
      {
        "id": 11638,
        "name": "Chutney & Pickle "
      },
      {
        "id": 11639,
        "name": "Peanut Butter"
      },
      {
        "id": 11634,
        "name": "Asian Sauces"
      },
      {
        "id": 11640,
        "name": "Chyawanprash & Honey"
      },
      {
        "id": 105531,
        "name": "Syrups"
      },
      {
        "id": 326530,
        "name": "Dips & Salad Dressings"
      },
      {
        "id": 11633,
        "name": "Cooking Sauces"
      },
      {
        "id": 11635,
        "name": "Premium"
      }
    ]
  },
  {
    "name": "Sweets & Chocolates",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNjc=",
    "groupings": [
      {
        "id": 11414,
        "name": "Chocolates"
      },
      {
        "id": 11415,
        "name": "Chocolate Packs"
      },
      {
        "id": 18681,
        "name": "Chocolate Gift Pack"
      },
      {
        "id": 11418,
        "name": "Indian Sweets"
      },
      {
        "id": 11417,
        "name": "Candies & Gum"
      },
      {
        "id": 13640,
        "name": "Premium"
      },
      {
        "id": 18685,
        "name": "Energy Bars"
      },
      {
        "id": 11419,
        "name": "Syrups"
      }
    ]
  },
  {
    "name": "Tea, Coffee & Milk Drinks",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTA=",
    "groupings": [
      {
        "id": 11617,
        "name": "Tea"
      },
      {
        "id": 11618,
        "name": "Coffee"
      },
      {
        "id": 18677,
        "name": "Hot Chocolate"
      },
      {
        "id": 11619,
        "name": "Green Tea"
      },
      {
        "id": 11622,
        "name": "Milk Drinks"
      },
      {
        "id": 11620,
        "name": "Cold Coffee & Ice Tea"
      },
      {
        "id": 11621,
        "name": "Bags & Premixes"
      },
      {
        "id": 11623,
        "name": "Premium"
      },
      {
        "id": 899305,
        "name": "Herbal Infusion"
      }
    ]
  }
];;

  // ---------- Helpers ----------
  const LIMIT = 15, MAX_PAGES = 200; // safety ceiling
  const MIN_DISCOUNT_CUTOFF = 50; // Stop fetching next pages once discount drops below 50%
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const tx = (v) => (v && typeof v === "object" ? v.text || "" : v == null ? "" : String(v));
  const toNum = (s) => { const n = parseFloat(String(s).replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : 0; };
  const round2 = (n) => Math.round(n * 100) / 100;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cap = (s) => String(s || "").split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "")).join(" ");

  // Session caches to prevent duplicate calls, scoped by store location
  const fullSearchCache = new Map();
  const megaScoutCache = new Map();
  const catDealsCache = new Map();

  function getCacheKey(prefix, key) {
    return `${CTX.lat || ""},${CTX.lon || ""}:${prefix}:${String(key).toLowerCase()}`;
  }

  // ---------- Parsing ----------
  function toItem(d) {
    const ci = (d.atc_action && d.atc_action.add_to_cart && d.atc_action.add_to_cart.cart_item) || null;
    const name = tx(d.name) || (ci && (ci.display_name || ci.product_name)) || "";
    const price = toNum(tx(d.normal_price)) || Number(ci && ci.price) || 0;
    let mrp = toNum(tx(d.mrp)) || Number(ci && ci.mrp) || 0;
    if (!name || !price) return null;
    if (!mrp || mrp < price) mrp = price;

    const ratingNum = parseFloat(d.rating && d.rating.value);
    let badge = "";
    if (Array.isArray(d.product_badges) && d.product_badges.length) badge = tx(d.product_badges[0]);
    else if (d.product_badge_type) badge = String(d.product_badge_type);
    const img = (d.image && (d.image.url || d.image)) || (ci && ci.image_url) || "";
    const cat = tx(d.category_name) || tx(d.category) || tx(d.l1_category) || tx(d.sub_category) || (ci && (tx(ci.category_name) || tx(ci.l1_category) || tx(ci.category))) || "";

    return {
      productId: String(d.product_id != null ? d.product_id : (ci && ci.product_id) || ""),
      name,
      category: cat,
      categories: cat ? [cat] : [],
      brand: tx(d.brand_name) || d.brand || (ci && ci.brand) || "",
      variant: tx(d.variant) || (ci && ci.unit) || "",
      mrp,
      price,
      discountPct: round2(((mrp - price) / mrp) * 100),
      savings: round2(mrp - price),
      soldOut: d.is_sold_out === true || (ci && ci.inventory === 0) || d.inventory === 0,
      rating: Number.isFinite(ratingNum) ? ratingNum : null,
      ratingCount: d.rating && d.rating.count != null ? tx(d.rating.count) : "",
      badge,
      image: typeof img === "string" && img.startsWith("https://") ? img : "",
    };
  }

  // Walks the response structure safely
  function parseItems(json) {
    const out = [];
    (function walk(node, depth) {
      if (!node || typeof node !== "object" || depth > 14) return;
      if (Array.isArray(node)) { node.forEach((n) => walk(n, depth + 1)); return; }
      const d = node.data;
      if (d && typeof d === "object" && !Array.isArray(d)) {
        const item = toItem(d);
        if (item) { out.push(item); return; }
      }
      for (const k in node) walk(node[k], depth + 1);
    })(json && json.response ? json.response : json, 0);
    return out;
  }

  // ---------- Category Listing API ----------
  async function listingPage(o, offset, pageIdx, sortKey = "discount_desc") {
    const body = {
      offset: String(offset),
      limit: String(LIMIT),
      collection_filters: "[]",
      collection_group_id: String(o.group),
      collection_properties: JSON.stringify([{ id: 4179, name: "NEXT_PRODUCT_RECOMMENDATION", value: "true" }]),
      collection_uuid: o.cat,
      exclude_combos: "false",
      last_snippet_type: "product_card_snippet_type_2",
      last_widget_type: "product_container",
      oos_visibility: "true",
      page_index: String(pageIdx),
      products: "[]",
      total_entities_processed: String(offset),
      total_pagination_items: String(LIMIT * MAX_PAGES),
      applied_filters: null,
      sort: sortKey,
    };
    const url = `https://blinkit.com/v1/layout/listing_widgets?collection_uuid=${encodeURIComponent(o.cat)}&collection_group_id=${encodeURIComponent(o.group)}&sort=${encodeURIComponent(sortKey)}`;
    const r = await fetch(url, {
      method: "POST",
      signal: o.signal,
      headers: { "content-type": "application/json", app_client: "consumer_web", lat: CTX.lat, lon: CTX.lon },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  function shouldStopAtCutoff(pageItems) {
    if (!pageItems || pageItems.length === 0) return true;
    if (pageItems.every((it) => it.soldOut)) return true;
    const lastRow = pageItems.slice(-3);
    const hasAboveCutoff = lastRow.some((it) => Math.round(it.discountPct) >= MIN_DISCOUNT_CUTOFF);
    return !hasAboveCutoff;
  }

  // ---------- Category Crawler ----------
  async function crawl(o, onProgress) {
    const seen = new Set();
    const items = [];
    let pageIdx = 0, offset = 0, failedPages = 0, complete = false;

    while (pageIdx < MAX_PAGES) {
      if (o.signal && o.signal.aborted) {
        if (items.length > 0) {
          return { items, complete: false, partial: failedPages > 0, cancelled: true, pagesScanned: pageIdx };
        }
        throw new DOMException("Aborted", "AbortError");
      }
      let resJson;
      try {
        resJson = await listingPage(o, offset, pageIdx, "discount_desc");
      } catch (err) {
        if (err.name === "AbortError" || (o.signal && o.signal.aborted)) {
          if (items.length > 0) {
            return { items, complete: false, partial: failedPages > 0, cancelled: true, pagesScanned: pageIdx };
          }
          throw err;
        }
        failedPages++;
        break;
      }

      const pageItems = parseItems(resJson);
      let newCount = 0;
      for (const it of pageItems) {
        const key = it.productId || (it.name + "|" + it.variant);
        if (!seen.has(key)) {
          seen.add(key);
          items.push(it);
          newCount++;
        }
      }

      pageIdx++;
      offset += LIMIT;
      onProgress(items.length, pageIdx);

      if (newCount === 0 || shouldStopAtCutoff(pageItems)) {
        complete = true;
        break;
      }
      await sleep(150);
      if (o.signal && o.signal.aborted) {
        if (items.length > 0) {
          return { items, complete: false, partial: failedPages > 0, cancelled: true, pagesScanned: pageIdx };
        }
        throw new DOMException("Aborted", "AbortError");
      }
    }

    return { items, complete: complete || pageIdx >= MAX_PAGES, partial: failedPages > 0, cancelled: false, pagesScanned: pageIdx };
  }

  // ---------- Keyword Search Crawler ----------
  async function crawlSearch(keyword, onProgress, signal) {
    const seen = new Set();
    const items = [];
    let pageIdx = 0, complete = false, partial = false;
    const MAX_SEARCH_PAGES = 3; // strictly max 3 pages

    while (!complete && pageIdx < MAX_SEARCH_PAGES) {
      if (signal && signal.aborted) {
        if (items.length > 0) {
          return { items, complete: false, partial, cancelled: true, pagesScanned: pageIdx };
        }
        throw new DOMException("Aborted", "AbortError");
      }

      const searchUrl = `https://blinkit.com/v1/layout/search?q=${encodeURIComponent(keyword)}&search_type=type_to_search&page_index=${pageIdx}&offset=${pageIdx * 15}&limit=15&oos_visibility=true&sort=discount_desc`;

      let json = null;
      try {
        const res = await fetch(searchUrl, {
          method: "POST",
          signal,
          headers: {
            "content-type": "application/json",
            accept: "*/*",
            app_client: "consumer_web",
            lat: CTX.lat,
            lon: CTX.lon,
          },
          body: JSON.stringify({
            query: keyword,
            q: keyword,
            search_query: keyword,
            page_index: pageIdx,
            offset: pageIdx * 15,
            limit: 15,
            oos_visibility: "true",
            sort: "discount_desc",
          }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        json = await res.json();
      } catch (err) {
        if (err.name === "AbortError" || (signal && signal.aborted)) {
          if (items.length > 0) {
            return { items, complete: false, partial, cancelled: true, pagesScanned: pageIdx };
          }
          throw err;
        }
        partial = true;
        break;
      }

      const list = parseItems(json);
      const beforeCount = items.length;

      if (list && list.length > 0) {
        list.forEach((it) => {
          const key = it.productId || (it.name + "|" + it.variant);
          if (!seen.has(key)) {
            seen.add(key);
            items.push(it);
          }
        });
      }

      pageIdx++;
      onProgress(items.length, pageIdx);

      // Page 1 (pageIdx === 1) is fetched by default regardless of discount.
      // Subsequent pages (pages 2 and 3) are fetched only if items were returned and discount >= MIN_DISCOUNT_CUTOFF.
      if (!list || list.length === 0 || (pageIdx >= 1 && (items.length === beforeCount || shouldStopAtCutoff(list)))) {
        complete = true;
      }

      if (!complete && pageIdx < MAX_SEARCH_PAGES) {
        await sleep(500); // 500ms courtesy pause between page calls
        if (signal && signal.aborted) {
          if (items.length > 0) {
            return { items, complete: false, partial, cancelled: true, pagesScanned: pageIdx };
          }
          throw new DOMException("Aborted", "AbortError");
        }
      }
    }

    return { items, complete, partial, cancelled: false, pagesScanned: pageIdx };
  }

  // ---------- 25 Main Categories Keywords for Mega Deals Scout ----------
  const ALL_KEYWORDS = [
    "atta", "rice", "dal", "ghee", "oil",
    "masala", "dry fruits", "dairy", "sweets", "chocolate",
    "snacks", "biscuits", "munchies", "instant", "tea",
    "coffee", "beverages", "ice cream", "bath", "skincare",
    "haircare", "oral", "detergents", "cleaning", "kitchen"
  ];

  const QUICK_KEYWORDS = [
    "Atta", "Rice", "Dal", "Ghee", "Sweets",
    "Chocolate", "Cake", "Snacks", "Dry Fruits", "Coffee",
    "Ice Cream", "Dairy", "Oil", "Skincare", "Beverages"
  ];

  async function fetchKeywordPage0(keyword, signal) {
    const fullKey = getCacheKey("search", keyword);
    if (fullSearchCache.has(fullKey)) {
      return fullSearchCache.get(fullKey).items;
    }
    const megaKey = getCacheKey("mega", keyword);
    if (megaScoutCache.has(megaKey)) {
      return megaScoutCache.get(megaKey).items;
    }
    const searchUrl = `https://blinkit.com/v1/layout/search?q=${encodeURIComponent(keyword)}&search_type=type_to_search&page_index=0&offset=0&limit=15&oos_visibility=true&sort=discount_desc`;
    const res = await fetch(searchUrl, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        accept: "*/*",
        app_client: "consumer_web",
        lat: CTX.lat,
        lon: CTX.lon,
      },
      body: JSON.stringify({
        query: keyword,
        q: keyword,
        search_query: keyword,
        page_index: 0,
        offset: 0,
        limit: 15,
        oos_visibility: "true",
        sort: "discount_desc",
      }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    return parseItems(json);
  }


const SCOUT_STYLE="*{box-sizing:border-box}:host,body{font:14px/1.5 'Avenir Next',Avenir,-apple-system,BlinkMacSystemFont,sans-serif;color:#1c3028}body{margin:0;background:#f4f3eb}button,input,select,textarea{font:inherit;color:inherit}button,select,input{border:1px solid #d5dacf;border-radius:10px;padding:11px 13px;background:#fff}button{cursor:pointer;font-weight:600}button:hover{border-color:#506c56}button:disabled{opacity:.45;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #839d28;outline-offset:3px}.primary{background:#d9ef71;color:#173526;border-color:#d9ef71;font-weight:800}#panel{position:fixed;z-index:2147483645;right:18px;top:85px;width:385px;max-width:calc(100vw - 24px);max-height:85vh;background:#fffef8;border:1px solid #d5dacf;border-radius:20px;box-shadow:0 18px 60px #152a2630;display:flex;flex-direction:column;overflow:hidden}#panel[hidden]{display:none}header,footer{padding:16px;background:#f1f3e9}.body{padding:16px;overflow:auto}.row{display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap}h3{margin:0;font-size:17px;letter-spacing:-.4px}small{display:block;color:#657365}#cats{max-height:225px;overflow:auto;margin:12px 0;border-block:1px solid #e4e8dc;padding:8px 0}#cats label{display:flex;align-items:center;gap:10px;padding:5px}input[type=checkbox]{accent-color:#294b36}textarea{width:100%;margin:8px 0;padding:10px;border:1px solid #d5dacf;border-radius:10px}#scan,#quick{width:100%;margin:7px 0}progress{display:block;width:100%;accent-color:#476732;height:7px;border:0;border-radius:10px;overflow:hidden}progress::-webkit-progress-bar{background:#e1e5d7}progress::-webkit-progress-value{background:#789535;border-radius:10px}#progress{font-size:12px;font-weight:650;margin:9px 0}#progress[data-state=error]{color:#a83b37}#progress[data-state=partial],#progress[data-state=stopped]{color:#86601f}#detail,#errors{overflow-wrap:anywhere}#errors{white-space:pre-wrap;max-height:100px;overflow:auto;font-size:11px}#launcher{position:fixed;bottom:20px;right:20px;z-index:2147483644;background:#1e3d2d;color:#e5f5ac;box-shadow:0 5px 20px #19322630;border:0;border-radius:40px;padding:14px 20px}main{max-width:1510px;margin:auto;padding:34px 40px 70px}.masthead{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #d7dccb;padding:0 0 17px;margin-bottom:28px}.wordmark{font-size:13px;letter-spacing:3px;font-weight:800}.edition{font-size:11px;color:#75816d;letter-spacing:1px}.hero{display:flex;justify-content:space-between;align-items:center;gap:20px}.hero h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(32px,4vw,52px);font-weight:400;letter-spacing:-1.8px;line-height:1.12;margin:0 0 9px}.subtitle{color:#6b7767;margin:0 0 24px}.hero-actions{display:flex;gap:8px;flex-wrap:wrap}.hero-actions button{font-size:12px;background:transparent}.scan-panel{padding:17px 20px;border:1px solid #d8dfca;background:#eef1df;border-radius:14px;margin:0 0 22px}#rs-status{font-size:12px;font-weight:650;margin-bottom:12px}.tools{display:flex;gap:9px;flex-wrap:wrap;background:#fffef9;padding:13px;border:1px solid #e0e4d8;border-radius:14px;position:sticky;top:10px;z-index:10;box-shadow:0 4px 15px #182b2005}.tools input{flex:1;min-width:180px;background:#f7f8f0}.tools select{max-width:240px;font-size:12px}.tools button{font-size:12px;background:#223e2f;color:white;border:0}.results-line{display:flex;align-items:center;justify-content:space-between;margin:22px 2px 16px}#rs-count{margin:0;font-size:13px;color:#64715e}.sort-note{font-size:11px;text-transform:uppercase;letter-spacing:1.3px;color:#7f8c72}#rs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:18px}.card{display:flex;flex-direction:column;border:1px solid #e0e4d9;border-radius:18px;background:#fffef9;color:#203629;text-decoration:none;min-width:0;overflow:hidden;transition:transform .18s,box-shadow .18s}.card:hover{transform:translateY(-4px);box-shadow:0 14px 30px #1f352614;border-color:#b6c49c}.media{position:relative;height:215px;background:#fff;display:flex;align-items:center;justify-content:center;margin:8px;border-radius:12px;overflow:hidden}.card img{width:77%;height:78%;object-fit:contain;mix-blend-mode:multiply}.badge{position:absolute;top:5px;right:5px;background:#dced83;color:#243c21;padding:9px 10px 8px;border-radius:6px 12px 6px 12px;display:flex;align-items:baseline;gap:3px;box-shadow:0 3px 0 #bdcf6d}.badge strong{font-size:20px;line-height:1;letter-spacing:-.8px}.badge span{font-size:9px;font-weight:900;letter-spacing:.4px}.card-body{padding:10px 17px 18px;display:flex;flex-direction:column;flex:1}.name{font-size:14px;line-height:1.45;font-weight:650;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:41px}.pack{font-size:12px;color:#7c8576;margin:7px 0 15px;min-height:18px}.price-row{display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;margin-top:auto;padding-top:13px;border-top:1px solid #edf0e4}.price{font-size:23px;font-weight:750;letter-spacing:-.7px}.mrp{font-size:11px;color:#8a9182;white-space:nowrap}.mrp s{font-size:13px;margin-left:4px;text-decoration-thickness:1px}.coverage{margin:26px 0 0;padding:12px 0;border-top:1px solid #d8dfca;color:#68785e;font-size:12px}.coverage summary{cursor:pointer}#rs-errors{white-space:pre-wrap;color:#92512e;font-size:12px;max-height:220px;overflow:auto}.empty{padding:45px 20px;color:#6b7767;text-align:center;grid-column:1/-1;background:#fffef9;border-radius:18px}.source-note{font-size:11px;color:#859079;margin-top:30px}.pin-row{padding:10px 0}.pin-row input{width:100%;margin:6px 0}#locate{width:100%;margin:4px 0 8px;font-size:12px}summary{padding:6px 0}#pages{max-width:100%;font-size:12px;margin:6px 0}#rs-new{border-color:#b2c891}.location-status{font-size:12px;padding:8px 0;color:#556849}@media(min-width:1500px){#rs-grid{grid-template-columns:repeat(6,1fr)}}@media(max-width:850px){main{padding:22px 20px 50px}.hero{align-items:flex-start;flex-direction:column;gap:0}.hero-actions{margin-bottom:20px}.tools{position:static}.media{height:190px}}@media(max-width:520px){main{padding:20px 12px}#rs-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.media{height:150px;margin:5px}.card{border-radius:13px}.card-body{padding:8px 11px 13px}.name{font-size:12px;min-height:35px}.price{font-size:20px}.mrp{font-size:9px}.mrp s{font-size:11px}.badge strong{font-size:16px}.badge{padding:6px}.badge span{font-size:8px}.tools select{flex:1;max-width:100%;min-width:125px}.sort-note{display:none}.edition{letter-spacing:0}.masthead{margin-bottom:20px}.hero h1{letter-spacing:-1px}.pack{font-size:10px;margin-bottom:10px}.price-row{gap:5px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}\n\n@media(max-width:600px){#panel{top:max(10px,env(safe-area-inset-top));right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);border-radius:16px}#panel button{min-height:44px}#cats label{min-height:42px}#panel footer{padding-bottom:max(14px,env(safe-area-inset-bottom))}.tools input,.tools select{min-height:44px}#launcher{bottom:max(12px,env(safe-area-inset-bottom));max-width:calc(100vw - 24px)}}\n\n/* Swift desktop results */\n.results-workspace{display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px;align-items:start}.filters{min-width:0}.filters .tools{position:sticky;top:14px;display:flex;flex-direction:column;align-items:stretch;padding:19px;background:#eef1e5;border-color:#d5ddc8;box-shadow:none}.filters .filter-title{font-size:18px;letter-spacing:-.4px;margin-bottom:2px}.filters .tools input,.filters .tools select,.filters .tools button{width:100%;max-width:none;min-width:0}.results-content{min-width:0}.swift-results .masthead{border-bottom-color:#cfd8c2}.swift-results .scan-panel{background:linear-gradient(110deg,#eef3e3,#f8f8f1)}\n\n/* Pocket mobile results */\n.pocket-results{background:#edf3ec}.pocket-results main{max-width:430px;min-height:100vh;padding:18px 14px 42px;background:#fffef9}.pocket-results .masthead{margin-bottom:16px;padding-bottom:12px}.pocket-results .wordmark{font-size:12px}.pocket-results .edition{font-size:9px}.pocket-results .hero{display:block}.pocket-results .hero h1{font-size:34px;line-height:1.03;margin-bottom:7px}.pocket-results .subtitle{margin-bottom:14px}.pocket-results .hero-actions{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px}.pocket-results .hero-actions button{min-height:44px;border:1px solid #cfd9c6;background:#fff}.pocket-results .scan-panel{padding:14px 16px;margin-bottom:14px;border-radius:15px;background:#edf3ec}.pocket-results .results-workspace{display:block}.pocket-results .filters .tools{position:static;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px;margin-bottom:14px;background:#f5f7ef;border-radius:15px}.pocket-results .filter-title,.pocket-results .filters .tools input,.pocket-results .filters .tools button{grid-column:1/-1}.pocket-results .filters .tools input,.pocket-results .filters .tools select,.pocket-results .filters .tools button{min-height:44px}.pocket-results .results-line{margin:16px 2px 12px}.pocket-results #rs-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pocket-results .card{border-radius:15px}.pocket-results .media{height:132px;margin:5px}.pocket-results .card-body{padding:8px 10px 12px}.pocket-results .name{font-size:12px;min-height:35px}.pocket-results .pack{font-size:10px;margin:5px 0 8px}.pocket-results .price-row{gap:5px;padding-top:9px}.pocket-results .price{font-size:19px}.pocket-results .mrp{font-size:9px}.pocket-results .mrp s{font-size:10px}.pocket-results .badge{padding:6px}.pocket-results .badge strong{font-size:15px}.pocket-results .badge span{font-size:7px}.pocket-results .sort-note{display:none}.pocket-results .coverage{margin-top:20px}\n\n@media(max-width:850px){.swift-results .results-workspace{grid-template-columns:190px minmax(0,1fr)}}\n@media(max-width:600px){#panel header{background:#edf3ec}#panel footer{background:#edf3ec}#panel .body{padding:14px 16px}#panel h3{font-size:19px}#panel #cats{max-height:190px}#panel #scan{background:#d9ef71;border-radius:14px}#panel #quick{border-radius:14px}.swift-results .results-workspace{display:block}.swift-results .filters .tools{position:static;display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px}.swift-results .filter-title,.swift-results .filters .tools input,.swift-results .filters .tools button{grid-column:1/-1}}\n";
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
    return words.map(name=>({name,keyword:true,category:'Keyword preview · taxonomy unverified',sourceGroup:g.name,pageLimit:1}));
  }).map(t=>[t.name.toLowerCase(),t])).values()];
  async function deadline(work,signal,ms,label='Setup'){
    const child=new AbortController();const abort=()=>child.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)child.abort();let timer,cancel;
    try{return await Promise.race([Promise.resolve().then(()=>{child.signal.throwIfAborted();return work(child.signal);}),new Promise((_,reject)=>{timer=setTimeout(()=>{reject(Error(label+' timed out. Retry when the website is ready.'));child.abort();},ms);cancel=()=>reject(new DOMException('Stopped','AbortError'));child.signal.addEventListener('abort',cancel,{once:true});})]);}
    finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);child.signal.removeEventListener('abort',cancel);}
  }
  function runner({request, context=()=>'', onChange=()=>{}, timeout=45000, idleTimeout=0, delay=0, concurrency=1}) {
    let generation=0, controller=null, items=new Map();
    const fresh=()=>({status:'idle',total:0,processed:0,succeeded:0,failed:0,limited:0,pages:0,current:'',detail:'',errors:[],coverage:[],started:0,ended:0});
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
      stop(){controller?.abort();},
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
        }catch(e){if(runId!==generation)return;state.errors.push(e.message);state.status='error';}
        finally{clearTimeout(budgetTimer);if(runId===generation){state.ended=Date.now();onChange({...state});}}
      }
    };return api;
  }
  return {tasks,keywordTasks,previewTasks,runner,pacer,deadline,categoryValues,categoryMatch,beverageCategory};
})();

/* Results are owned new tabs; shopping pages and previous results are never closed. */
function mountDealScout(adapter){
 const mobile=MarketplaceCore.isMobile(navigator);const ID='quick-deal-scout-v4-4';if(document.getElementById(ID)){document.getElementById(ID).shadowRoot.getElementById('panel').hidden=false;return;}
 const host=document.createElement('div');host.id=ID;document.body.append(host);const root=host.attachShadow({mode:'open'});
 const css=SCOUT_STYLE;
 root.innerHTML=`<style>${css}</style><button id="launcher">⚡ ${adapter.name} Scout v4.4</button><section id="panel"><header class="row"><h3>${adapter.name} Scout · v4.4</h3><button id="min" aria-label="Hide">−</button></header><div class="body"><small>${mobile?'Keep this tab open while searching. Tap View results when it finishes.':'Uses your selected delivery address. Results open in a new tab.'}</small><div class="row"><b>Choose categories</b><button id="all">All</button><button id="none">None</button></div><div id="cats">Loading categories…</div><label>Search level <select id="pages"><option value="1" selected>Fast · first page</option><option value="2">Quick · first 2 pages</option><option value="5">More results · first 5 pages</option><option value="20">Detailed · first 20 pages</option><option value="100">Maximum · up to 100 pages</option></select></label><button id="scan" class="primary" disabled>⚡ Find deals fast</button><button id="quick" disabled>Search all selected categories</button><small>Fast search gives quick results. Choose a higher search level when you want more products.</small><details><summary>Search for a product</summary><textarea id="keywords" rows="2" placeholder="diet coke, protein, air fryer"></textarea><button id="custom">Search these words</button><small>For this option, keep all category boxes selected.</small></details></div><footer><progress id="bar" value="0" max="1"></progress><div id="progress" role="status" aria-live="polite">Ready for a new search</div><small id="detail"></small><details><summary>Search notes</summary><pre id="errors"></pre></details><div class="row"><button id="stop" disabled>Stop</button><button id="view" disabled>Open results</button><button id="reset">New search</button></div></footer></section>`;
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
  $('stop').disabled=!busy;$('view').textContent=mobile?'View results ↗':'Open results tab';$('view').disabled=!active&&!runner.items.length; $('scan').disabled=busy||!groups.length;$('quick').disabled=busy||!groups.length;
  for(const e of root.querySelectorAll('#cats input,#locationpin,#pages,#keywords,#custom,#sample,#auto-locate,#locate,#all,#none'))e.disabled=busy;
  if(active){active.items=runner.items;active.status=text;active.errors=$('errors').textContent;active.version=s.pages+'|'+s.processed+'|'+s.status;paint(active);}
 }
 function freeze(){if(active){active.status=summary()+' · Snapshot; next scan starts in the original shopping tab';active.items=runner.items;active.live=false;paint(active);active=null;}}
 function reset(){const wasPreparing=preparing;epoch++;prepController?.abort();prepController=null;preparing=false;if(wasPreparing)$('panel').hidden=false;freeze();runner.reset();$('keywords').value='';message='';phaseError=false;render();}
 function resultTab(){
  if(active&&!active.win.closed)return active;
  const win=window.open('','_blank');if(!win){message='Browser blocked the results tab. Click Open results tab, or allow popups for this site. The shopping page stays open.';render();return null;}
  win.document.title=adapter.name+' Deals · Scout v4.4';const doc=win.document;const encoding=node(doc,'meta');encoding.setAttribute('charset','utf-8');const viewport=node(doc,'meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';doc.head.prepend(encoding,viewport);doc.body.replaceChildren();doc.body.className=mobile?'pocket-results':'swift-results';const style=node(doc,'style',css);const main=node(doc,'main');doc.body.append(style,main);
  const v={win,root:main,items:runner.items,live:true,status:summary(),errors:'',stamp:''};active=v;
  const mast=node(doc,'div');mast.className='masthead';const mark=node(doc,'div','DEAL / SCOUT');mark.className='wordmark';const edition=node(doc,'div','YOUR NEIGHBOURHOOD. BETTER DEALS.');edition.className='edition';mast.append(mark,edition);main.append(mast);
  const header=node(doc,'div');header.className='hero';const title=node(doc,'div');title.append(node(doc,'h1',adapter.name+' deals'));const sub=node(doc,'p','The best savings, in one place.');sub.className='subtitle';title.append(sub);header.append(title);const actions=node(doc,'div');actions.className='hero-actions';const stop=node(doc,'button','Stop scan');stop.onclick=()=>{if(v.live){if(preparing)reset();else runner.stop();}};const fresh=node(doc,'button','Start a new search ↗');fresh.id='rs-new';fresh.onclick=()=>{if(v.live)reset();};actions.append(stop,fresh);header.append(actions);main.append(header);
  const scan=node(doc,'div');scan.className='scan-panel';const status=node(doc,'div');status.id='rs-status';const progress=node(doc,'progress');progress.id='rs-progress';progress.max=1;scan.append(status,progress);main.append(scan);
  const tools=node(doc,'div');tools.className='tools';const filterTitle=node(doc,'strong','Filter results');filterTitle.className='filter-title';const q=node(doc,'input');q.id='rs-q';q.placeholder='Product or brand';const cat=node(doc,'select');cat.id='rs-cat';cat.append(node(doc,'option','All categories'));
  const deals=node(doc,'select');deals.id='rs-deals';for(const [value,label] of [['discounted','Discounted products'],['all','All products · include 0% / unknown discount']]){const o=node(doc,'option',label);o.value=value;deals.append(o);}
  const sort=node(doc,'select');sort.id='rs-sort';for(const [value,label] of [['discount','Highest discount'],['price','Lowest selling price'],['saving','Largest saving']]){const o=node(doc,'option',label);o.value=value;sort.append(o);}
  const csv=node(doc,'button','Download CSV');csv.onclick=()=>{const rows=[['name','pack','selling_price','mrp','discount_percent','parent_category','subcategory','all_categories','url'],...v.items.map(p=>[p.name,p.pack,p.price,p.mrp,p.discount,p.parentCategory,p.subcategory,DealScoutCore.categoryValues(p).join(' | '),p.url])];const text=rows.map(row=>row.map(value=>{let t=String(value??'');if(/^[=+@-]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';}).join(',')).join('\r\n');const u=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=node(doc,'a');a.href=u;a.download=adapter.name+'-deals.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);};tools.append(filterTitle,q,cat,deals,sort,csv);for(const e of [q,cat,deals,sort])e.oninput=()=>grid(v);
  const line=node(doc,'div');line.className='results-line';const count=node(doc,'p');count.id='rs-count';const orderNote=node(doc,'span','FIND SOMETHING GOOD');orderNote.className='sort-note';line.append(count,orderNote);const cards=node(doc,'div');cards.id='rs-grid';const notes=node(doc,'details');notes.className='coverage';notes.append(node(doc,'summary','Search notes'));const errors=node(doc,'pre');errors.id='rs-errors';notes.append(node(doc,'p','Fast search checks the first results. Choose a higher search level for more products. Prices apply to your selected delivery address.'),errors);const note=node(doc,'p','Products open in a new tab. Your shopping page and earlier results stay open.');note.className='source-note';const workspace=node(doc,'div');workspace.className='results-workspace';const filters=node(doc,'aside');filters.className='filters';filters.append(tools);const content=node(doc,'section');content.className='results-content';content.append(line,cards,notes,note);workspace.append(filters,content);main.append(workspace);paint(v);return v;
 }

 function paint(v){if(v.win.closed)return;v.root.querySelector('#rs-status').textContent=v.status;const s=runner.state;v.root.querySelector('#rs-progress').value=s.total?s.processed/s.total:0;v.root.querySelector('#rs-errors').textContent=v.errors;const stamp=v.items.length+'|'+v.version;if(stamp!==v.stamp){v.stamp=stamp;grid(v);}}
 function grid(v){const main=v.root,doc=main.ownerDocument,cat=main.querySelector('#rs-cat'),selected=cat.value;const values=[...new Set(v.items.flatMap(p=>DealScoutCore.categoryValues(p)))];if(values.some(DealScoutCore.beverageCategory))values.push('Beverages');cat.replaceChildren(node(doc,'option','All categories'));for(const name of [...new Set(values)].sort())cat.append(node(doc,'option',name));if([...cat.options].some(o=>o.value===selected))cat.value=selected;
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
  try{if(adapter.requiresPin)$('panel').hidden=true;await DealScoutCore.deadline(signal=>adapter.prepare?.(signal),prepController.signal,12000,'Delivery session setup');if(token!==epoch)return;if(adapter.requiresPin)$('locationpin').value=adapter.getPin();if(token!==epoch)return;preparing=false;if(adapter.requiresPin)$('panel').hidden=false;if(!mobile&&!active)resultTab();message=mobile||active?'':'Click Open results tab if your browser blocked it.';await runner.start(queue,{budget:mode==='sample'?25000:0});if(mobile&&token===epoch){message=runner.items.length?'Tap View results to open your deals in a new tab.':'';render();}}catch(e){if(token===epoch){preparing=false;phaseError=true;message=e.message;render();}}finally{if(token===epoch&&adapter.requiresPin)$('panel').hidden=false;}
 }
 $('scan').onclick=()=>start('sample');$('quick').onclick=()=>start('categories');$('custom').onclick=()=>start('custom');$('reset').onclick=reset;$('view').onclick=()=>{message='';resultTab();render();};$('stop').onclick=()=>preparing?reset():runner.stop();
 $('quick').after(node(document,'small','Fast search stops after 25 seconds. A full category search follows the search level you choose.'));
 $('all').onclick=()=>root.querySelectorAll('#cats input').forEach(c=>c.checked=true);$('none').onclick=()=>root.querySelectorAll('#cats input').forEach(c=>c.checked=false);$('min').onclick=()=>$('panel').hidden=true;$('launcher').onclick=()=>$('panel').hidden=!$('panel').hidden;
 const timer=setInterval(()=>{if(!host.isConnected){runner.stop();clearInterval(timer);return;}if(active?.win.closed){active=null;reset();}else if(runner.state.status==='running'||preparing)render();},700);
 DealScoutCore.deadline(signal=>adapter.categories(signal),undefined,12000,'Category loading').then(list=>{groups=list;$('cats').replaceChildren();for(const g of groups){const label=node(document,'label'),check=node(document,'input');check.type='checkbox';check.value=g.id;check.checked=true;label.append(check,document.createTextNode(g.name));$('cats').append(label);}render();}).catch(e=>{message='Category list unavailable: '+e.message;phaseError=true;render();});
}

const PLATFORM_ADAPTER="blinkit";
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
    name:'Zepto',hosts:['zepto.com'],delay:400,context:()=>{const s=ZeptoSessionCore.selected(getCookie,localStorage);return [s.storeId,s.latitude,s.longitude].join('|');},
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
