frappe.ui.form.on("Package Transport", {
    setup(frm) {
        // Restrict Shipping Provider picker to suppliers in the "Shipping Provider" Supplier Group.
        frm.set_query("shipping_provider", () => ({
            filters: { supplier_group: "Shipping Provider" },
        }));

        // Restrict Shipping Provider Address picker to addresses linked to the selected supplier.
        frm.set_query("shipping_provider_address", () => {
            if (!frm.doc.shipping_provider) {
                return { filters: { name: ["in", []] } };
            }
            return {
                query: "frappe.contacts.doctype.address.address.address_query",
                filters: {
                    link_doctype: "Supplier",
                    link_name: frm.doc.shipping_provider,
                },
            };
        });

        // Restrict driver invoice picker. If the Driver has a linked Supplier,
        // narrow to Purchase Invoices for that Supplier.
        frm.set_query("driver_invoice", () => {
            const filters = { docstatus: ["!=", 2] };
            if (frm.doc.__driver_supplier) {
                filters.supplier = frm.doc.__driver_supplier;
            }
            return { filters };
        });
    },

    refresh(frm) {
        // Cache the driver's linked Supplier (if any) for the driver_invoice query.
        if (frm.doc.driver && !frm.doc.__driver_supplier) {
            frappe.db.get_value("Driver", frm.doc.driver, "supplier").then((r) => {
                if (r && r.message) {
                    frm.doc.__driver_supplier = r.message.supplier || null;
                }
            });
        }
    },

    driver(frm) {
        if (!frm.doc.driver) {
            frm.set_value("departing_address", null);
            frm.doc.__driver_supplier = null;
            return;
        }
        frappe.db
            .get_value("Driver", frm.doc.driver, ["address", "supplier"])
            .then((r) => {
                if (r && r.message) {
                    frm.set_value("departing_address", r.message.address || null);
                    frm.doc.__driver_supplier = r.message.supplier || null;
                }
            });
    },

    shipping_provider(frm) {
        // Clear the dependent address whenever the supplier changes.
        frm.set_value("shipping_provider_address", null);
    },
});
