// Warranty plans from the Full Circle sales consultant guide (revised July 2025).
// Each row: [min selling price, max selling price (null = and over), plan A code, plan A price, plan B code, plan B price]
// Plan A = Signature Plus (or 5 Year for furniture), plan B = Signature (or 3 Year for furniture). null = not offered.

const SP = ["Signature Plus", "Signature"];

module.exports = [
  { id: "furniture", name: "Furniture", plans: ["5 Year (care kit incl.)", "3 Year"], match: /sofa|loveseat|chair|sectional|recliner|table|dining|bed|dresser|chest|nightstand|furniture|ottoman|futon|stand|desk|bench|cabinet|bookcase|headboard|mirror|bar stool/i,
    note: "Care kit (UPHOLKIT fabric / WOODKIT1 wood) included on plans sold on invoices $500+ - apply code FCR to the kit.",
    rows: [
      [0, 49.99, null, null, "ALLFR301", 5.99], [50, 99.99, null, null, "ALLFR302", 11.99], [100, 149.99, null, null, "ALLFR303", 19.99],
      [150, 199.99, null, null, "ALLFR304", 27.99], [200, 249.99, null, null, "ALLFR305", 32.99], [250, 299.99, null, null, "ALLFR306", 39.99],
      [300, 399.99, null, null, "ALLFR307", 52.99], [400, 499.99, null, null, "ALLFR308", 64.99],
      [500, 599.99, "ALLFR501", 105.99, "ALLFR309", 84.99], [600, 749.99, "ALLFR502", 139.99, "ALLFR310", 99.99],
      [750, 949.99, "ALLFR503", 174.99, "ALLFR311", 124.99], [950, 1249.99, "ALLFR504", 199.99, "ALLFR312", 159.99],
      [1250, 1499.99, "ALLFR505", 254.99, "ALLFR313", 189.99], [1500, 1749.99, "ALLFR506", 305.99, "ALLFR314", 209.99],
      [1750, 2149.99, "ALLFR507", 364.99, "ALLFR315", 259.99], [2150, 2499.99, "ALLFR508", 394.99, "ALLFR316", 279.99],
      [2500, 2999.99, "ALLFR509", 419.99, "ALLFR317", 319.99], [3000, 3499.99, "ALLFR510", 459.99, "ALLFR318", 379.99],
      [3500, 3999.99, "ALLFR511", 509.99, "ALLFR319", 449.99], [4000, 4999.99, "ALLFR512", 569.99, "ALLFR320", 489.99],
      [5000, 5999.99, "ALLFR513", 629.99, "ALLFR321", 569.99], [6000, 6999.99, "ALLFR514", 699.99, "ALLFR322", 659.99],
      [7000, 7999.99, "ALLFR515", 749.99, "ALLFR323", 729.99], [8000, 8999.99, "ALLFR516", 829.99, "ALLFR324", 799.99],
      [9000, 9999.99, "ALLFR517", 929.99, "ALLFR325", 899.99], [10000, 12999.99, "ALLFR518", 1029.99, "ALLFR326", 929.99],
      [13000, null, "ALLFR519", 1299.99, "ALLFR327", 999.99]] },
  { id: "adjbase", name: "Adjustable base", plans: ["Adjustable Base Warranty", null], bySize: true, match: /adjustable/i,
    rows: [["Twin XL", "ADJBWTY1", 129.99], ["Full", "ADJBWTY2", 139.99], ["Queen", "ADJBWTY3", 149.99], ["King", "ADJBWTY4", 169.99]] },

  { id: "fridge", name: "Refrigerator", plans: SP, match: /fridge|refrigerator/i, rows: [
      [0, 399.99, "001ARFPA", 89.99, "001ARFSA", 69.99], [400, 499.99, "001ARFPB", 119.99, "001ARFSB", 99.99],
      [500, 599.99, "001ARFPC", 149.99, "001ARFSC", 119.99], [600, 799.99, "001ARFPD", 174.99, "001ARFSD", 144.99],
      [800, 999.99, "001ARFPE", 219.99, "001ARFSE", 179.99], [1000, 1199.99, "001ARFPF", 249.99, "001ARFSF", 209.99],
      [1200, 1499.99, "001ARFPG", 279.99, "001ARFSG", 229.99], [1500, 1999.99, "001ARFPH", 319.99, "001ARFSH", 269.99],
      [2000, 2999.99, "001ARFPI", 379.99, "001ARFSI", 319.99], [3000, 3999.99, "001ARFPJ", 419.99, "001ARFSJ", 349.99],
      [4000, 4999.99, "001ARFPK", 499.99, "001ARFSK", 419.99], [5000, 7999.99, "001ARFPL", 589.99, "001ARFSL", 499.99],
      [8000, null, "001ARFPM", 689.99, "001ARFSM", 589.99]] },
  { id: "freezer", name: "Freezer", plans: SP, match: /freezer/i, rows: [
      [0, 299.99, "001AFZPA", 79.99, "001AFZSA", 59.99], [300, 599.99, "001AFZPB", 119.99, "001AFZSB", 99.99],
      [600, 999.99, "001AFZPC", 149.99, "001AFZSC", 129.99], [1000, null, "001AFZPD", 189.99, "001AFZSD", 159.99]] },
  { id: "erange", name: "Electric range", plans: SP, match: /electric range|range.*electric/i, rows: [
      [0, 399.99, "001AERPA", 99.99, "001AERSA", 79.99], [400, 599.99, "001AERPB", 149.99, "001AERSB", 129.99],
      [600, 799.99, "001AERPC", 179.99, "001AERSC", 149.99], [800, 999.99, "001AERPD", 199.99, "001AERSD", 169.99],
      [1000, 1499.99, "001AERPE", 239.99, "001AERSE", 199.99], [1500, 1999.99, "001AERPF", 279.99, "001AERSF", 229.99],
      [2000, null, "001AERPG", 299.99, "001AERSG", 249.99]] },
  { id: "dfrange", name: "Dual fuel range", plans: SP, match: /dual fuel/i, rows: [
      [0, 1999.99, "001ADFPA", 269.99, "001ADFSA", 229.99], [2000, null, "001ADFPB", 419.99, "001ADFSB", 349.99]] },
  { id: "grange", name: "Gas range", plans: SP, match: /gas range|range.*gas/i, rows: [
      [0, 399.99, "001AGRPA", 119.99, "001AGRSA", 99.99], [400, 599.99, "001AGRPB", 149.99, "001AGRSB", 129.99],
      [600, 799.99, "001AGRPC", 179.99, "001AGRSC", 149.99], [800, 999.99, "001AGRPD", 199.99, "001AGRSD", 169.99],
      [1000, 1499.99, "001AGRPE", 239.99, "001AGRSE", 199.99], [1500, 1999.99, "001AGRPF", 279.99, "001AGRSF", 229.99],
      [2000, null, "001AGRPG", 349.99, "001AGRSG", 299.99]] },
  { id: "otr", name: "OTR microwave", plans: SP, match: /over.the.range|otr/i, rows: [
      ["Carry-in", null, "001AMIPA", 59.99, "001AMISA", 49.99], [0, 399.99, "001AMIPB", 99.99, "001AMISB", 89.99],
      [400, 699.99, "001AMIPC", 109.99, "001AMISC", 99.99], [700, 999.99, "001AMIPD", 139.99, "001AMISD", 129.99],
      [1000, null, "001AMIPE", 159.99, "001AMISE", 149.99]] },
  { id: "walloven", name: "Wall oven", plans: SP, match: /wall oven/i, rows: [
      ["Double wall oven", null, "001ADBPA", 419.99, "001ADBSA", 349.99], ["Gas $0-$1,999.99", null, "001AGWPA", 189.99, "001AGWSA", 159.99],
      [0, 1999.99, "001AWOPA", 149.99, "001AWOSA", 129.99], [2000, 2999.99, "001AWOPB", 299.99, "001AWOSB", 249.99],
      [3000, null, "001AWOPC", 359.99, "001AWOSC", 299.99]] },
  { id: "hood", name: "Range hood", plans: SP, match: /hood/i, rows: [
      [0, 699.99, "001AHDPA", 39.99, "001AHDSA", 29.99], [700, 1499.99, "001AHDPB", 69.99, "001AHDSB", 49.99],
      [1500, null, "001AHDPC", 129.99, "001AHDSC", 109.99]] },
  { id: "cooktop", name: "Cooktop", plans: SP, match: /cooktop/i, rows: [
      ["Gas $0-$1,999.99", null, "001AGCPA", 169.99, "001AGCSA", 139.99], [0, 1999.99, "001AECPA", 149.99, "001AECSA", 119.99],
      [2000, null, "001ACKPB", 239.99, "001ACKSB", 199.99]] },
  { id: "dishwasher", name: "Dishwasher", plans: SP, match: /dishwasher/i, rows: [
      [0, 399.99, "001ADWPA", 129.99, "001ADWSA", 99.99], [400, 599.99, "001ADWPB", 149.99, "001ADWSB", 129.99],
      [600, 699.99, "001ADWPC", 179.99, "001ADWSC", 149.99], [700, 799.99, "001ADWPD", 199.99, "001ADWSD", 169.99],
      [800, 899.99, "001ADWPE", 219.99, "001ADWSE", 184.99], [900, 999.99, "001ADWPF", 239.99, "001ADWSF", 199.99],
      [1000, 1499.99, "001ADWPG", 269.99, "001ADWSG", 229.99], [1500, null, "001ADWPH", 309.99, "001ADWSH", 259.99]] },
  { id: "washer", name: "Washer", plans: SP, match: /washer/i, rows: [
      [0, 599.99, "001AWAPA", 199.99, "001AWASA", 169.99], [600, 799.99, "001AWAPB", 239.99, "001AWASB", 199.99],
      [800, 999.99, "001AWAPC", 279.99, "001AWASC", 229.99], [1000, 1199.99, "001AWAPD", 309.99, "001AWASD", 259.99],
      [1200, 1499.99, "001AWAPE", 359.99, "001AWASE", 299.99], [1500, null, "001AWAPF", 419.99, "001AWASF", 349.99]] },
  { id: "dryer", name: "Dryer", plans: SP, match: /dryer/i, rows: [
      [0, 399.99, "001ADRPA", 129.99, "001ADRSA", 99.99], [400, 599.99, "001ADRPB", 139.99, "001ADRSB", 119.99],
      [600, 799.99, "001ADRPC", 159.99, "001ADRSC", 139.99], [800, 999.99, "001ADRPD", 199.99, "001ADRSD", 169.99],
      [1000, null, "001ADRPE", 239.99, "001ADRSE", 199.99]] },
  { id: "laundrycentre", name: "Laundry centre", plans: SP, match: /laundry cent/i, rows: [["All prices", null, "001ALCPA", 299.99, "001ALCSA", 249.99]] },
  { id: "allinone", name: "All-in-one laundry", plans: SP, match: /all.in.one|washer.dryer combo/i, rows: [["All prices", null, "001AAIPA", 329.99, "001AAISA", 279.99]] },
  { id: "package", name: "Appliance value package (system price)", plans: SP, match: /package|laundry set/i,
    note: "Sold on the total system price of the included appliances on the same invoice. Not for any single product over $2,500. Countertop microwaves, small appliances and accessories are not included.",
    rows: [
      ["2-pc under $1,500", null, "001AP2PU", 269.95, "001AP2SU", 229.95], ["2-pc $1,500 and over", null, "001AP2PO", 439.95, "001AP2SO", 299.95],
      ["3-pc under $2,200", null, "001AP3PU", 469.95, "001AP3SU", 329.95], ["3-pc $2,200 and over", null, "001AP3PO", 559.95, "001AP3SO", 389.95],
      ["4-pc under $2,900", null, "001AP4PU", 589.95, "001AP4SU", 399.95], ["4-pc $2,900 and over", null, "001AP4PO", 699.95, "001AP4SO", 479.95],
      ["5-pc under $3,500", null, "001AP5PU", 669.95, "001AP5SU", 459.95], ["5-pc $3,500 and over", null, "001AP5PO", 789.95, "001AP5SO", 539.95],
      ["6-pc under $4,000", null, "001AP6PU", 759.95, "001AP6SU", 529.95], ["6-pc $4,000-$4,999", null, "001AP6PB", 879.95, "001AP6SB", 599.95],
      ["6-pc $5,000 and over", null, "001AP6PO", 959.95, "001AP6SO", 659.95]] },
  { id: "cooling", name: "Air conditioner", plans: SP, match: /air condition/i, rows: [
      [0, 449.99, null, null, "001AACSA", 69.99], [450, null, null, null, "001AACSB", 99.99]] },
  { id: "heating", name: "Heating (firebox)", plans: SP, match: /firebox|fireplace insert|heater/i, rows: [["All prices", null, null, null, "001AFRSA", 69.99]] },
  { id: "vacuum", name: "Vacuum", plans: SP, match: /vacuum/i, rows: [["Upright", null, null, null, "001AVASA", 34.99], ["Canister", null, null, null, "001APVSA", 119.99]] },
  { id: "bbq", name: "Barbeque", plans: SP, match: /bbq|barbe|grill/i, rows: [
      [0, 249.99, null, null, "001ABBSA", 49.99], [250, 499.99, null, null, "001ABBSB", 59.99],
      [500, 999.99, null, null, "001ABBSC", 69.99], [1000, null, null, null, "001ABBSD", 89.99]] },
  { id: "small", name: "Small appliance (2 yr replacement)", plans: ["2 Year Replacement", null], match: /blender|toaster|kettle|coffee|air fryer|mixer|countertop microwave|small appliance/i,
    note: "Includes countertop microwaves $129.99 and under.", rows: [
      [0, 59.99, "001ASM2A", 9.99, null, null], [60, 99.99, "001ASM2B", 14.99, null, null], [100, 199.99, "001ASM2C", 19.99, null, null],
      [200, 399.99, "001ASM2D", 44.99, null, null], [400, 599.99, "001ASM2E", 69.99, null, null]] },

  { id: "tv", name: "Television", plans: SP, match: /tv|television/i, rows: [
      [0, 199.99, "001ETVPA", 39.99, "001ETVSA", 33.99], [200, 299.99, "001ETVPB", 49.99, "001ETVSB", 42.99],
      [300, 399.99, "001ETVPC", 79.99, "001ETVSC", 67.99], [400, 499.99, "001ETVPD", 109.99, "001ETVSD", 89.99],
      [500, 599.99, "001ETVPE", 129.99, "001ETVSE", 109.99], [600, 699.99, "001ETVPF", 159.99, "001ETVSF", 139.99],
      [700, 799.99, "001ETVPG", 179.99, "001ETVSG", 149.99], [800, 899.99, "001ETVPH", 199.99, "001ETVSH", 169.99],
      [900, 999.99, "001ETVPI", 209.99, "001ETVSI", 179.99], [1000, 1199.99, "001ETVPJ", 229.99, "001ETVSJ", 199.99],
      [1200, 1399.99, "001ETVPK", 269.99, "001ETVSK", 229.99], [1400, 1599.99, "001ETVPL", 299.99, "001ETVSL", 254.99],
      [1600, 1799.99, "001ETVPM", 329.99, "001ETVSM", 279.99], [1800, 1999.99, "001ETVPN", 349.99, "001ETVSN", 299.99],
      [2000, 2499.99, "001ETVPO", 409.99, "001ETVSO", 349.99], [2500, 2999.99, "001ETVPP", 479.99, "001ETVSP", 409.99],
      [3000, 3999.99, "001ETVPQ", 579.99, "001ETVSQ", 489.99], [4000, 4999.99, "001ETVPR", 679.99, "001ETVSR", 579.99],
      [5000, null, "001ETVPS", 879.99, "001ETVSS", 749.99]] },
  { id: "speakers", name: "Subwoofer / speakers", plans: SP, match: /subwoofer|speaker/i, rows: [
      [0, 199.99, "001EAUPA", 34.99, "001EAUSA", 29.99], [200, 399.99, "001EAUPB", 44.99, "001EAUSB", 39.99],
      [400, 599.99, "001EAUPC", 69.99, "001EAUSC", 59.99], [600, 799.99, "001EAUPD", 89.99, "001EAUSD", 79.99],
      [800, 999.99, "001EAUPE", 119.99, "001EAUSE", 99.99], [1000, 1499.99, "001EAUPF", 159.99, "001EAUSF", 139.99],
      [1500, null, "001EAUPG", 189.99, "001EAUSG", 159.99]] },
  { id: "soundbar", name: "Home theatre / sound bar", plans: SP, match: /sound ?bar|home theat/i, rows: [
      [0, 199.99, "001EHTPA", 49.99, "001EHTSA", 39.99], [200, 399.99, "001EHTPB", 69.99, "001EHTSB", 59.99],
      [400, 599.99, "001EHTPC", 89.99, "001EHTSC", 79.99], [600, 799.99, "001EHTPD", 119.99, "001EHTSD", 99.99],
      [800, 1299.99, "001EHTPE", 149.99, "001EHTSE", 129.99], [1300, 1999.99, "001EHTPF", 189.99, "001EHTSF", 159.99],
      [2000, null, "001EHTPG", 239.99, "001EHTSG", 199.99]] },
  { id: "audio", name: "Audio components / Bluetooth speakers", plans: SP, match: /bluetooth|audio|receiver|turntable/i, rows: [
      [0, 249.99, "001ECOPA", 49.99, "001ECOSA", 39.99], [250, 499.99, "001ECOPB", 59.99, "001ECOSB", 49.99],
      [500, 999.99, "001ECOPC", 69.99, "001ECOSC", 59.99], [1000, null, "001ECOPD", 99.99, "001ECOSD", 79.99]] },
  { id: "dvd", name: "DVD / Blu-ray / satellite / cable", plans: SP, match: /dvd|blu-ray|bluray/i, rows: [
      [0, 49.99, "001EDVPA", 24.99, "001EDVSA", 19.99], [50, 99.99, "001EDVPB", 29.99, "001EDVSB", 24.99],
      [100, 149.99, "001EDVPC", 34.99, "001EDVSC", 29.99], [150, 249.99, "001EDVPD", 49.99, "001EDVSD", 39.99],
      [250, 349.99, "001EDVPE", 59.99, "001EDVSE", 49.99], [350, 449.99, "001EDVPF", 69.99, "001EDVSF", 59.99],
      [450, null, "001EDVPG", 79.99, "001EDVSG", 69.99]] },
  { id: "arcade", name: "Arcade", plans: SP, match: /arcade/i, rows: [
      [0, 499.99, "001EACPA", 94.99, "001EACSA", 89.99], [500, null, "001EACPB", 109.99, "001EACSB", 99.99]] },
  { id: "monitor", name: "Computer monitor", plans: SP, match: /monitor/i, rows: [
      [0, 199.99, null, null, "001ECMSC", 19.99], [200, 299.99, null, null, "001ECMSD", 44.99], [300, 399.99, null, null, "001ECMSE", 54.99],
      [400, 599.99, null, null, "001ECMSF", 79.99], [600, 799.99, null, null, "001ECMSG", 99.99]] }
];
