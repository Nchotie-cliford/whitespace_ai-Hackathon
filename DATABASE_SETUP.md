**Database Pack**

This project now uses one unified schema file and one unified seed file for the same Supabase database.

**Run Order**

1. [database_schema.sql](C:/Users/cliff/OneDrive/Dokumente/New%20project/database_schema.sql)
2. [database_seed.sql](C:/Users/cliff/OneDrive/Dokumente/New%20project/database_seed.sql)

**What Each File Does**

- [database_schema.sql](C:/Users/cliff/OneDrive/Dokumente/New%20project/database_schema.sql)
  Creates the full database structure in one pass:
  HERO mirror tables, dispatch tables, richer demo context tables, business expansion tables, dashboard views, and the optional recommendation RPC.

- [database_seed.sql](C:/Users/cliff/OneDrive/Dokumente/New%20project/database_seed.sql)
  Seeds the entire dataset in one pass:
  base demo company data, richer HERO-style context, business/commercial history, and the larger challenge-scale historical dataset.

**Quick Verification**

```sql
select count(*) from hero_customers;
select count(*) from hero_project_matches;
select count(*) from hero_tasks;
select count(*) from quotes;
select count(*) from invoices;
select count(*) from payments;
select count(*) from time_logs;
select count(*) from project_notes;
```

**Notes**

- All files are written for the same Supabase project.
- The seed file is additive and uses `ON CONFLICT` patterns where practical.
- The unified schema includes the recommendation RPC already.
