const DRIVER_DETAILS_METHOD =
    "shipping_logistics.shipping_logistics.doctype.package_transport.package_transport.get_driver_details";

function load_driver_details(frm) {
    if (!frm.doc.driver) return Promise.resolve({});
    return frappe
        .call({
            method: DRIVER_DETAILS_METHOD,
            args: { driver: frm.doc.driver },
        })
        .then((r) => (r && r.message) || {});
}

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

        // Show non-cancelled Purchase Invoices. Driver doesn't have a linked
        // Supplier in standard ERPNext, so we don't auto-filter by supplier.
        frm.set_query("driver_invoice", () => ({
            filters: { docstatus: ["!=", 2] },
        }));
    },

    driver(frm) {
        if (!frm.doc.driver) {
            frm.set_value("departing_address", null);
            return;
        }
        load_driver_details(frm).then((data) => {
            frm.set_value("departing_address", data.address || null);
        });
    },

    shipping_provider(frm) {
        // Clear the dependent address whenever the supplier changes.
        frm.set_value("shipping_provider_address", null);
    },
});
