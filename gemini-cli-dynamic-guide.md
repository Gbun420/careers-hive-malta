# Careers Hive Gemini CLI Enhancement Guide
## Dynamic Real-Data Integration (Zero Mock Data)

This guide defines the system for integrating real-time data into Careers Hive using Gemini CLI, ensuring zero hardcoded numbers or mock data in marketing copy.

### 🎯 KEY FEATURES

1. **12 Dynamic Data Sources (All Real-Time)**
2. **Zero Hardcoding Rule**: Always use `${variable_name}` syntax.
3. **Smart Fallback System**: Defined text when data is unavailable.
4. **Automatic Staleness Detection**: Hide metrics if older than threshold.

### 📊 DATA SOURCES

| Source | Variable | Refresh |
|--------|----------|---------|
| Active Job Seekers | `${active_job_seekers}` | Hourly |
| Verified Employers | `${verified_employers}` | Daily |
| Job Postings | `${total_job_postings}` | Real-time |
| Alert Delivery Time | `${alert_delivery_time}` | Daily |
| Verified Jobs % | `${verified_postings_pct}` | Daily |
| Featured Adoption | `${featured_adoption_rate}` | Weekly |

### 🛠 IMPLEMENTATION (Next.js 15)

Use `fetchDynamicMetrics` from `@/lib/metrics` in Server Components.

```typescript
const metrics = await fetchDynamicMetrics({
  queries: ['active_job_seekers', 'total_job_postings'],
  fallbacks: true
});
```

### 📋 GEMINI CLI PROMPTS

- Use `@homepage-hero-dynamic` for hero sections.
- Use `@pricing-proof-dynamic` for pricing social proof.
- Use `@trust-signals-dynamic` for verification messaging.

---
*All metrics = live data. All numbers = accurate. Always current.*
