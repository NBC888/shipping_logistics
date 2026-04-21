# Shipping Logistics

Frappe/ERPNext V16 custom app for logging transportation of packages handed off to third-party shipping providers.

## Features

Introduces a single DocType: **Package Transport**, which tracks:

- Status lifecycle: `Scheduled` → `In Progress` → `Completed`, plus `Overdue` (auto) and `Cancelled`
- Date of Creation and Date of Transport
- Package counts per category: Express, International, US, Canadian (plus auto total)
- Driver (from the ERPNext `Driver` doctype) and auto-populated Departing Address
- Shipping Provider (restricted to Suppliers in the `Shipping Provider` Supplier Group) and one of that supplier's linked Addresses
- Attachments for Border Form, Manifest, and Shipping Provider Form
- Link to the Driver's Purchase Invoice

A daily scheduler job flips `Scheduled` records to `Overdue` when the transport date has passed.

## Install

Prerequisites: Supplier Group named `Shipping Provider` must exist on the site.

```bash
bench get-app /path/to/shipping_logistics
bench --site <your-site> install-app shipping_logistics
bench --site <your-site> migrate
```

## License

MIT
