const DRIVER_DETAILS_METHOD =
    "shipping_logistics.shipping_logistics.doctype.package_transport.package_transport.get_driver_details";

function load_driver_details(frm) {
    if (!frm.doc.driver) {
        frm.doc.__driver_transporter = null;
        return Promise.resolve({});
    }
    return frappe
        .call({
            method: DRIVER_DETAILS_METHOD,
            args: { driver: frm.doc.driver },
        })
        .then((r) => {
            const data = (r && r.message) || {};
            frm.doc.__driver_transporter = data.transporter || null;
            return data;
        });
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

        // Restrict Driver's Supplier Invoice picker to Purchase Invoices
        // for the Driver's Transporter (linked Supplier). When no driver is
        // selected (or the driver has no transporter), show nothing rather
        // than every invoice in the system.
        frm.set_query("driver_invoice", () => {
            const filters = { docstatus: ["!=", 2] };
            if (frm.doc.__driver_transporter) {
                filters.supplier = frm.doc.__driver_transporter;
            } else {
                // No transporter known yet — return an impossible filter so
                // the picker stays empty until a driver is chosen.
                filters.name = ["in", []];
            }
            return { filters };
        });
    },

    refresh(frm) {
        // On form load (e.g. reopening a saved record), resolve the
        // driver's transporter so the invoice picker filters correctly.
        if (frm.doc.driver && !frm.doc.__driver_transporter) {
            load_driver_details(frm);
        }
    },

    driver(frm) {
        if (!frm.doc.driver) {
            frm.set_value("departing_address", null);
            frm.set_value("driver_invoice", null);
            frm.doc.__driver_transporter = null;
            return;
        }
        load_driver_details(frm).then((data) => {
            frm.set_value("departing_address", data.address || null);
            // Clear any previously-selected invoice since it may belong to
            // a different supplier than the new driver's transporter.
            frm.set_value("driver_invoice", null);
        });
    },

    shipping_provider(frm) {
        // Clear the dependent address whenever the supplier changes.
        frm.set_value("shipping_provider_address", null);
    },
});
