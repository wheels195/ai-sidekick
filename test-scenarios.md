# Test Scenarios for Audit Verification

## Sample Sanitized Requests

### 1. Places API Request for ZIP 30301 (Atlanta, GA)
```json
{
  "textQuery": "landscaping companies near 30301",
  "maxResultCount": 15,
  "languageCode": "en",
  "regionCode": "US",
  "locationBias": {
    "circle": {
      "center": {
        "latitude": 33.7490,
        "longitude": -84.3880
      },
      "radius": 50000
    }
  }
}
```

### 2. Places API Request for ZIP 75034 (Frisco, TX)
```json
{
  "textQuery": "landscaping companies near 75034",
  "maxResultCount": 15,
  "languageCode": "en",
  "regionCode": "US",
  "locationBias": {
    "circle": {
      "center": {
        "latitude": 33.1507,
        "longitude": -96.8236
      },
      "radius": 50000
    }
  }
}
```

### 3. Google CSE Request with Enhanced Parameters
```
https://www.googleapis.com/customsearch/v1?
key=REDACTED&
cx=43d07c544e509463a&
q=landscaping industry trends 2025&
num=8&
dateRestrict=d90&
gl=us&
lr=lang_en&
sort=date&
fields=items(title,link,snippet,displayLink)
```

## Sample Table Outputs

### Places API Results Table (Sanitized)
```html
<div style="margin: 20px 0; border-radius: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(52, 211, 153, 0.3);">
<table style="width: 100%; border-collapse: collapse; font-family: Inter, system-ui, sans-serif;">
<thead>
<tr style="background: rgba(52, 211, 153, 0.15);">
<th style="padding: 12px; color: #10b981; font-weight: 600; border-bottom: 1px solid rgba(52, 211, 153, 0.3);">Business</th>
<th style="padding: 12px; color: #10b981; font-weight: 600; border-bottom: 1px solid rgba(52, 211, 153, 0.3);">Rating</th>
<th style="padding: 12px; color: #10b981; font-weight: 600; border-bottom: 1px solid rgba(52, 211, 153, 0.3);">Price</th>
<th style="padding: 12px; color: #10b981; font-weight: 600; border-bottom: 1px solid rgba(52, 211, 153, 0.3);">Contact</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding: 10px; color: #f3f4f6; border-bottom: 1px solid rgba(52, 211, 153, 0.1);">**GreenScape Atlanta**</td>
<td style="padding: 10px; color: #f3f4f6; border-bottom: 1px solid rgba(52, 211, 153, 0.1);">4.8⭐ (127 reviews)</td>
<td style="padding: 10px; color: #f3f4f6; border-bottom: 1px solid rgba(52, 211, 153, 0.1);">$$$</td>
<td style="padding: 10px; color: #f3f4f6; border-bottom: 1px solid rgba(52, 211, 153, 0.1);">(404) 555-0123</td>
</tr>
</tbody>
</table>
</div>
```

## Cache Key Examples

### Places Cache Keys
- Without coordinates: `landscaping companies|30301`
- With coordinates: `landscaping companies|30301|33.7490|-84.3880|50000`

### CSE Cache Keys  
- Trends search: `landscaping trends|trends` (with d90 date filter)
- Regulatory: `permits landscaping|regulatory` (with y2 date filter)
- General: `landscape design|general` (with y1 date filter)

## Temperature Routing Examples

### Query Analysis
- "What's the average price for lawn care?" → 0.2 (factual)
- "Write me a proposal template" → 0.5 (scripts/templates)  
- "Brainstorm creative marketing ideas" → 0.7 (brainstorming)
- "How do I improve my business?" → 0.5 (default)

## RAG Output Format (No Provenance)
```
RELEVANT BUSINESS CONTEXT:

Seasonal pricing strategies typically increase rates by 15-20% during peak growing seasons (spring and summer) when demand is highest...

---

Customer retention rates improve significantly when businesses implement systematic follow-up processes...

---

Integrate this information naturally into your response without mentioning sources, files, or external references. Present insights as your own business expertise.
```

## Geocoding Persistence Flow
1. User sets ZIP code: 75034
2. System checks user_profiles for existing lat/lng 
3. If not found: geocodes 75034 → lat: 33.1507, lng: -96.8236
4. Saves to user_profiles: latitude=33.1507, longitude=-96.8236, location="Frisco, TX, USA"
5. Subsequent calls reuse stored coordinates
6. All Places API calls include locationBias with these coordinates