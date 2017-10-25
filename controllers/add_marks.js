var data = [{ Clicks: 210, Company: "A", _id: { CompanyID: 5 } }, { Clicks: 35, Company: "C", _id: { CompanyID: 3 } }, { Clicks: 15, Company: "B", _id: { CompanyID: 2 } }, { Clicks: 13, Company: "A", _id: { CompanyID: 5 } }],
    result = data.reduce(function (hash) {
        return function (r, a) {
            var key = a._id.CompanyID;
            if (!hash[key]) {
                hash[key] = { Clicks: 0, Company: a.Company, _id: a._id };
                r.push(hash[key]);
            }
            hash[key].Clicks += a.Clicks;
            return r;
        };
    }(Object.create(null)), []);

console.log(result);