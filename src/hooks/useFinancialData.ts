import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Transaction, FinancialData, CategoryData, ProjectData, MonthlyData } from '../types/financial';

const sampleCSVData = `Accounts receivable,,,,
Date,Reference,Description,VAT,Amount
2025-07-02,INV 2025-0009 - RebelsAI B.V.,2025-0009,,5324
2025-06-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0007 RF33NHVC7H3A",,-4235
2025-06-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0008 RF57WPG6UF7S",,-2117.5
2025-06-03,INV 2025-0007 - Medio Zorg B.V.,2025-0007,,4235
2025-06-03,INV 2025-0008 - Medio Zorg B.V.,2025-0008,,2117.5
2025-05-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Burgermeister Patrick CH56 0839 8064 2115 0510 4
Pitch deck / Branding / Logo",,-1815
2025-05-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
Invoice 2025-0006",,-8470
2025-05-01,PAY 2025-0005 - ,,,14822.5
2025-05-01,PAY 2025-0004 - ,,,-14822.5
2025-05-01,INV 2025-0004 - Medio Zorg B.V.,2025-0004,,14822.5
2025-05-01,INV 2025-0005 - Medio Zorg B.V.,2025-0005,,-14822.5
2025-05-01,INV 2025-0006 - Medio Zorg B.V.,2025-0006,,8470
2025-04-26,INV 2025-0003 - Patrick Burgermeister,2025-0003,,1815
2025-03-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0002 RF12JDZ3CVMN",,-4840
2025-03-11,INV 2025-0002 - Medio Zorg B.V.,2025-0002,,4840
2025-02-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0001 RF31YKQC4JYP",,-6352.5
2025-02-11,INV 2025-0001 - Medio Zorg B.V.,2025-0001,,6352.5
2024-12-31,Opening balance of Accounts receivable,,,0
Total,,,,5324
Bunq NL75BUNQ2145840184 (10201),,,,
Date,Reference,Description,VAT,Amount
2025-07-10,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-07-10 EUR",,0.22
2025-07-10,TRA Bunq NL75BUNQ2145840184 (Ponto),"HubSpot Netherlands B.
HubSpot Netherlands B. Schiphol, NL
",,-18.15
2025-07-09,TRA Bunq NL75BUNQ2145840184 (Ponto),"SumUp  *Midi
SumUp  *Midi Leiden, NL
",,-8.07
2025-07-09,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVLD5D6L8Y4X95Z7
NLOVLD5D6L8Y4X95Z7 www.ovpay.nl, NL
",,-8.3
2025-07-09,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVGY5BE94GQ9QJLP
NLOVGY5BE94GQ9QJLP www.ovpay.nl, NL
",,-8.3
2025-07-08,TRA Bunq NL75BUNQ2145840184 (Ponto),"Moneybird B.V. NL65 ADYB 2006 0111 62
Moneybird B.V. 2025-472188 MoneyBird B.V.",,-4.84
2025-07-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR USAGE  JUN
CURSOR USAGE  JUN NEW YORK, US
0.60 USD, 1 USD = 0.85000 EUR",,-0.51
2025-07-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"Order qKrg4EOvJMMY - M
Order qKrg4EOvJMMY - M Enschede, NL
",,-16.94
2025-07-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM SAN FRANCISCO, US
25.25 USD, 1 USD = 0.85584 EUR",,-21.61
2025-07-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-07-03 EUR",,1.55
2025-07-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 28266127",,-13.99
2025-07-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV6PJ6DN8X7MRJ9V
NLOV6PJ6DN8X7MRJ9V www.ovpay.nl, NL
",,-8.3
2025-07-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVLD5D6LQ7M9Y5Z7
NLOVLD5D6LQ7M9Y5Z7 www.ovpay.nl, NL
",,-8.3
2025-07-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"KOYEB SERVERLESS CLOUD
KOYEB SERVERLESS CLOUD BOULOGNE-BILL, FR
5.59 USD, 1 USD = 0.85868 EUR",,-4.8
2025-07-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"SLACK T08BRSCGMR7
SLACK T08BRSCGMR7 DUBLIN, IE
",,-69.88
2025-07-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google GSUITE_longevai
Google GSUITE_longevai Dublin, IE
",,-64.8
2025-07-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google CLOUD xV85v5
Google CLOUD xV85v5 Dublin, IE
",,-15.7
2025-06-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"Taxpas NL43 RABO 0171 7985 03
Factuur 25700371",,-145.2
2025-06-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"Belastingdienst NL86 INGB 0002 4455 88
1867554616501050",,-222
2025-06-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"Belastingdienst NL86 INGB 0002 4455 88
5867554616501040",,-414
2025-06-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-06-26 EUR",,0.69
2025-06-25,TRA Bunq NL75BUNQ2145840184 (Ponto),"Catalin-Stefan Niculescu NL12 INGB 0524 6254 68
Salary May",,-971.26
2025-06-25,TRA Bunq NL75BUNQ2145840184 (Ponto),"Stichting Pay.nl NL35 RABO 0117 7136 78
Pay.nl inzake 50plus Mobiel B.V. / 251327262 / 50plus Mobiel - Abonnement / IO-2156-5663-4193",,-3.25
2025-06-24,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVKLJ4Z8EYGPLJZY
NLOVKLJ4Z8EYGPLJZY www.ovpay.nl, NL
",,-4.6
2025-06-24,TRA Bunq NL75BUNQ2145840184 (Ponto),"Zettle_*Seats2Meet.com
Zettle_*Seats2Meet.com UTRECHT, NL
",,-15
2025-06-24,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVKLJ4Z8X9AW9JZY
NLOVKLJ4Z8X9AW9JZY www.ovpay.nl, NL
",,-4.6
2025-06-23,TRA Bunq NL75BUNQ2145840184 (Ponto),"Catalin-Stefan Niculescu NL12 INGB 0524 6254 68
Salary April (adjustment)",,-85.6
2025-06-22,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVQX584GPYRAB54M
NLOVQX584GPYRAB54M www.ovpay.nl, NL
",,-9.6
2025-06-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"APOLLO.IO
APOLLO.IO COVINA, US
59.00 USD, 1 USD = 0.87746 EUR",,-51.77
2025-06-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR, AI POWERED IDE
CURSOR, AI POWERED IDE +18314259504, US
20.00 USD, 1 USD = 0.87600 EUR",,-17.52
2025-06-18,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVKLJ4ZPYLMY8JZY
NLOVKLJ4ZPYLMY8JZY www.ovpay.nl, NL
",,-4.6
2025-06-18,TRA Bunq NL75BUNQ2145840184 (Ponto),"NS GROEP IZ NS REIZIGERS NL59 ABNA 0590 8498 75
Factuur: 410017755209",,-27.99
2025-06-18,TRA Bunq NL75BUNQ2145840184 (Ponto),"Zettle_*Seats2Meet com
Zettle_*Seats2Meet com UTRECHT, NL
",,-7.5
2025-06-18,TRA Bunq NL75BUNQ2145840184 (Ponto),"Zettle_*Seats2Meet.com
Zettle_*Seats2Meet.com UTRECHT, NL
",,-7.5
2025-06-18,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVZE5XLV789EM5LD
NLOVZE5XLV789EM5LD www.ovpay.nl, NL
",,-4.6
2025-06-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0007 RF33NHVC7H3A",,4235
2025-06-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0008 RF57WPG6UF7S",,2117.5
2025-06-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-06-12 EUR",,0.05
2025-06-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Hetzner Online GmbH
Hetzner Online GmbH Gunzenhausen, DE
",,-5.12
2025-06-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Moneybird B.V. NL65 ADYB 2006 0111 62
Moneybird B.V. 2025-394132 MoneyBird B.V.",,-4.84
2025-06-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-06-05 EUR",,2.51
2025-06-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV8R5LY47QMAXJM6
NLOV8R5LY47QMAXJM6 www.ovpay.nl, NL
",,-10.4
2025-06-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV9B5G47KNE4QJ8Y
NLOV9B5G47KNE4QJ8Y www.ovpay.nl, NL
",,-10.4
2025-06-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"Catalin-Stefan Niculescu NL12 INGB 0524 6254 68
Salary April",,-1480.79
2025-06-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM +14158304762, US
25.25 USD, 1 USD = 0.88832 EUR",,-22.43
2025-06-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 27327427",,-13.99
2025-06-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"KOYEB SERVERLESS CLOUD
KOYEB SERVERLESS CLOUD +33972455503, FR
5.17 USD, 1 USD = 0.88781 EUR",,-4.59
2025-06-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google GSUITE_longevai
Google GSUITE_longevai Dublin, IE
",,-64.8
2025-06-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"SLACK T08BRSCGMR7
SLACK T08BRSCGMR7 +35315137661, IE
",,-69.24
2025-06-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google CLOUD FRQCS9
Google CLOUD FRQCS9 Dublin, IE
",,-89.51
2025-05-29,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVW7JWB4MXWYP5VP
NLOVW7JWB4MXWYP5VP www.ovpay.nl, NL
",,-4.6
2025-05-29,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-05-29 EUR",,0.75
2025-05-28,TRA Bunq NL75BUNQ2145840184 (Ponto),"Zettle_*Seats2Meet com
Zettle_*Seats2Meet com UTRECHT, NL
",,-15
2025-05-28,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVAZJRZ7ZZQ88JMG
NLOVAZJRZ7ZZQ88JMG www.ovpay.nl, NL
",,-4.6
2025-05-28,TRA Bunq NL75BUNQ2145840184 (Ponto),"AnyHouse NL NL53 ABNA 0120 6060 11
5",,-90
2025-05-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"COOLLABS TECHNOLOGIES
COOLLABS TECHNOLOGIES +36208508920, HU
5.00 USD, 1 USD = 0.88400 EUR",,-4.42
2025-05-22,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVQX584EG8QXL54M
NLOVQX584EG8QXL54M www.ovpay.nl, NL
",,-4.6
2025-05-22,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-05-22 EUR",,0.18
2025-05-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"Zettle_*Seats2Meet.com
Zettle_*Seats2Meet.com UTRECHT, NL
",,-7.5
2025-05-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"Zettle_*Seats2Meet.com
Zettle_*Seats2Meet.com UTRECHT, NL
",,-7.5
2025-05-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"TWILIO INC
TWILIO INC +18778894546, US
20.00 USD, 1 USD = 0.89600 EUR",,-17.92
2025-05-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV8R5LYGPXZGXJM6
NLOV8R5LYGPXZGXJM6 www.ovpay.nl, NL
",,-4.6
2025-05-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"APOLLO.IO
APOLLO.IO +14156912009, US
59.00 USD, 1 USD = 0.89593 EUR",,-52.86
2025-05-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR, AI POWERED IDE
CURSOR, AI POWERED IDE +18314259504, US
20.00 USD, 1 USD = 0.90250 EUR",,-18.05
2025-05-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV6PJ6DQ7GZ4BJ9V
NLOV6PJ6DQ7GZ4BJ9V www.ovpay.nl, NL
",,-4.6
2025-05-15,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVAZJRZY6RY7WJMG
NLOVAZJRZY6RY7WJMG www.ovpay.nl, NL
",,-4.6
2025-05-15,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-05-15 EUR",,0.14
2025-05-13,TRA Bunq NL75BUNQ2145840184 (Ponto),"OPENAI
OPENAI +14158799686, US
5.00 USD, 1 USD = 0.90800 EUR",,-4.54
2025-05-13,TRA Bunq NL75BUNQ2145840184 (Ponto),"BCK*NS SchiedamC 203
BCK*NS SchiedamC 203 SCHIEDAM, NL
",,-11.9
2025-05-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Helios B.V. NL31 BUNQ 2145 9961 76
",,4.6
2025-05-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Restaurant VIALIS
Restaurant VIALIS HOUTEN, NL
",,-4.6
2025-05-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Burgermeister Patrick CH56 0839 8064 2115 0510 4
Pitch deck / Branding / Logo",,1815
2025-05-11,TRA Bunq NL75BUNQ2145840184 (Ponto),"OPENROUTER, INC
OPENROUTER, INC +18482974487, US
10.95 USD, 1 USD = 0.89772 EUR",,-9.83
2025-05-08,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVQX584XX9Z6E54M
NLOVQX584XX9Z6E54M www.ovpay.nl, NL
",,-11.7
2025-05-08,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-05-08 EUR",,17.92
2025-05-07,TRA Bunq NL75BUNQ2145840184 (Ponto),"Diogo Guedes Leal PT50 0023 0000 4566 2730 1169 4
FT ATSIRE01FT/2",,-1800
2025-05-07,TRA Bunq NL75BUNQ2145840184 (Ponto),"Diogo Guedes Leal PT50 0023 0000 4566 2730 1169 4
FT ATSIRE01FT/1",,-1800
2025-05-07,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV6PJ6DXYKVB7J9V
NLOV6PJ6DXYKVB7J9V www.ovpay.nl, NL
",,-11.7
2025-05-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Hetzner Online GmbH
Hetzner Online GmbH Gunzenhausen, DE
",,-0.67
2025-05-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"50plus Mobiel B.V.
2912462001Xbf604 7370495466094909 Eerste rekening - 250977200",,-3.25
2025-05-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Back Market
Back Market Paris, FR
",,-1597.99
2025-05-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Moneybird B.V. NL65 ADYB 2006 0111 62
Moneybird B.V. 2025-315550 MoneyBird B.V.",,-4.84
2025-05-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM +14158304762, US
12.09 USD, 1 USD = 0.89165 EUR",,-10.78
2025-05-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 26440727",,-13.99
2025-05-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
Invoice 2025-0006",,8470
2025-05-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google GSUITE_longevai
Google GSUITE_longevai Dublin, IE
",,-64.8
2025-05-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-05-01 EUR",,0.04
2025-05-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"SLACK T08BRSCGMR7
SLACK T08BRSCGMR7 +35315137661, IE
",,-117.47
2025-04-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"Peter van de Pas NL43 RABO 0171 7985 03
Creditnota",,228.4
2025-04-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"Taxpas NL43 RABO 0171 7985 03
Factuur 25700293",,-342.6
2025-04-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"Belastingdienst Apeldoorn NL86 INGB 0002 4455 88
3867 5546 1150 1210",,-1942
2025-04-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"COOLLABS TECHNOLOGIES
COOLLABS TECHNOLOGIES +36208508920, HU
5.00 USD, 1 USD = 0.88800 EUR",,-4.44
2025-04-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"AnyHouse NL NL53 ABNA 0120 6060 11
3",,-255
2025-04-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"Helios B.V. NL31 BUNQ 2145 9961 76
",,7.99
2025-04-24,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVD6JKPNV6RBX5WA
NLOVD6JKPNV6RBX5WA www.ovpay.nl, NL
",,-4.9
2025-04-24,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-04-24 EUR",,0.18
2025-04-23,TRA Bunq NL75BUNQ2145840184 (Ponto),"R Dubas NL53 ABNA 0120 6060 11
",,-21.31
2025-04-23,TRA Bunq NL75BUNQ2145840184 (Ponto),"Helios B.V. NL31 BUNQ 2145 9961 76
",,-7.99
2025-04-23,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVX75P8BML8ME58Z
NLOVX75P8BML8ME58Z www.ovpay.nl, NL
",,-2.8
2025-04-22,TRA Bunq NL75BUNQ2145840184 (Ponto),"Digidentity BV via Stichting Mollie Payments
956969aebc2470afe52e632f38834ce8 8152275757467698 Invoice PI-2025-011612 Digidentity BV",,-108.9
2025-04-22,TRA Bunq NL75BUNQ2145840184 (Ponto),"NS Reizigers B.V.
VC88751928 8030096942436630 NS Zakelijk 88751928",,-0.01
2025-04-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR, AI POWERED IDE
CURSOR, AI POWERED IDE +18314259504, US
20.00 USD, 1 USD = 0.88650 EUR",,-17.73
2025-04-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Moneybird B.V. NL65 ADYB 2006 0111 62
Moneybird B.V. 2025-235898 MoneyBird B.V.",,-4.84
2025-04-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV8R5LYKKGAGMJM6
NLOV8R5LYKKGAGM6 www.ovpay.nl, NL
",,-6.34
2025-04-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-04-03 EUR",,0.98
2025-04-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 25456814",,-13.99
2025-04-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM +14158304762, US
7.25 USD, 1 USD = 0.93241 EUR",,-6.76
2025-04-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google GSUITE_longevai
Google GSUITE_longevai Dublin, IE
",,-49.64
2025-03-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"FACEBK *PAYMENT
Refund: FACEBK *PAYMENT fb.me/cc, US
1.00 USD, 1 USD = 0.93000 EUR",,0.93
2025-03-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"FACEBK *PAYMENT
FACEBK *PAYMENT fb.me/cc, US
1.00 USD, 1 USD = 0.93000 EUR",,-0.93
2025-03-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"SLACK T08BRSCGMR7
SLACK T08BRSCGMR7 +35315137661, IE
",,-19.97
2025-03-30,TRA Bunq NL75BUNQ2145840184 (Ponto),"CLAUDE.AI SUBSCRIPTION
CLAUDE.AI SUBSCRIPTION +14152360599, US
",,-21.78
2025-03-28,TRA Bunq NL75BUNQ2145840184 (Ponto),"ALBERT HEIJN 1151
ALBERT HEIJN 1151 LEIDSCHENDAM, NL
",,-139.09
2025-03-28,TRA Bunq NL75BUNQ2145840184 (Ponto),"Ozan Market
Ozan Market LEIDSCHENDAM, NL
",,-49.59
2025-03-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-03-27 EUR",,0.18
2025-03-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVMQJA9NE4ZKYJ67
NLOVMQJA9NE4ZKYJ67 www.ovpay.nl, NL
",,-8.3
2025-03-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVD6JKPM7K9RK5WA
NLOVD6JKPM7K9RK5WA www.ovpay.nl, NL
",,-7.3
2025-03-24,TRA Bunq NL75BUNQ2145840184 (Ponto),"CanvaPtyLimited
WZNNDPSP26QR6QZ32LUVB 7180304273305196 paAAAGRKLXDQDLWA",,-17.5
2025-03-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR, AI POWERED IDE
CURSOR, AI POWERED IDE +18314259504, US
20.00 USD, 1 USD = 0.92250 EUR",,-18.45
2025-03-18,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVD6JKPMZE6PN5WA
NLOVD6JKPMZE6PN5WA www.ovpay.nl, NL
",,-11.5
2025-03-17,TRA Bunq NL75BUNQ2145840184 (Ponto),"CCV*Griekse Taverne Br
CCV*Griekse Taverne Br SCHIEDAM, NL
",,-7
2025-03-17,TRA Bunq NL75BUNQ2145840184 (Ponto),"Lisa
Lisa ROTTERDAM, NL
",,-13.95
2025-03-17,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOV485Q7BVEZXL59L
NLOV485Q7BVEZXL59L www.ovpay.nl, NL
",,-12.85
2025-03-13,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVLD5D69K6GAE5Z7
NLOVLD5D69K6GAE5Z7 www.ovpay.nl, NL
",,-10
2025-03-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVGY5BEN6NPD6JLP
NLOVGY5BEN6NPD6JLP www.ovpay.nl, NL
",,-12.93
2025-03-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0002 RF12JDZ3CVMN",,4840
2025-03-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVDRJZK8X84BX5EY
NLOVDRJZK8X84BX5EY www.ovpay.nl, NL
",,-9.6
2025-03-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Moneybird B.V. NL65 ADYB 2006 0111 62
Moneybird B.V. 2025-157551 MoneyBird B.V.",,-4.84
2025-03-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-03-06 EUR",,0.29
2025-03-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"Robijs Dubass LT21 3250 0084 6242 5191
Invoice 2",,-195
2025-03-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVMQJA9YBYZBKJ67
NLOVMQJA9YBYZBKJ67 www.ovpay.nl, NL
",,-2.8
2025-03-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"Weena B.V.
Weena B.V. ROTTERDAM, NL
",,-11.25
2025-03-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVB85Y4XWYAL9JVE
NLOVB85Y4XWYAL9JVE www.ovpay.nl, NL
",,-11.47
2025-03-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM +14158304762, US
7.06 USD, 1 USD = 0.96742 EUR",,-6.83
2025-03-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 24609161",,-13.99
2025-03-01,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google GSUITE_longevai
Google GSUITE_longevai Dublin, IE
",,-22.56
2025-02-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVLD5D66ZENEX5Z7
NLOVLD5D66ZENEX5Z7 www.ovpay.nl, NL
",,-20
2025-02-27,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-02-27 EUR",,0.19
2025-02-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"soupenzo vanbaerle
soupenzo vanbaerle AMSTERDAM, NL
",,-7
2025-02-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"soupenzo vanbaerle
soupenzo vanbaerle AMSTERDAM, NL
",,-22.01
2025-02-26,TRA Bunq NL75BUNQ2145840184 (Ponto),"Q PARK SYMPHONY
Q PARK SYMPHONY AMSTERDAM, NL
",,-45
2025-02-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
Refund: RENDER.COM +14158304762, US
1.00 USD, 1 USD = 0.96000 EUR",,0.96
2025-02-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM +14158304762, US
1.00 USD, 1 USD = 0.96000 EUR",,-0.96
2025-02-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"Transavia
WQZPLKM8NDLQ8PF32I2L5 7180325795417176 F8MM6S 131540145",,-22
2025-02-21,TRA Bunq NL75BUNQ2145840184 (Ponto),"Booking.com
KCXDTGV77WNZ5WG62LUUJ 7180545771297521 Flights on Booking.com",,-245
2025-02-20,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-02-20 EUR",,0.82
2025-02-20,TRA Bunq NL75BUNQ2145840184 (Ponto),"EQ Verhoef NL25 INGB 0703 8531 04
",,-22.3
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Cosmina NL05 BUNQ 2033 4746 07
Customer meeting - Invoice scanned",,-14.1
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Cosmina NL05 BUNQ 2033 4746 07
Pay back 100 eur loan",,-100
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"EQ Verhoef NL25 INGB 0703 8531 04
Cursor AI Diogo + Logo LongevAI",,-40
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"CCV*Kamer v Koophandel
CCV*Kamer v Koophandel Utrecht, NL
",,-82.25
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR, AI POWERED IDE
CURSOR, AI POWERED IDE +18314259504, US
20.00 USD, 1 USD = 0.96300 EUR",,-19.26
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"KVK NL31 DEUT 0319 8105 77
Factuur 250038464",,-82.25
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Robijs Dubass LT21 3250 0084 6242 5191
Invoice 1",,-330
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"GeniusInvest B.V. NL64 BUNQ 2039 4455 44
Pay back invoice Firm24, 2025-1789",,-1838.52
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Cosmina NL05 BUNQ 2033 4746 07
GoDaddy invoice 3468599476",,-6.04
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Cosmina NL05 BUNQ 2033 4746 07
GoDaddy invoice 3500777110",,-24.54
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Taxpas NL43 RABO 0171 7985 03
Invoice 25700096",,-139.15
2025-02-19,TRA Bunq NL75BUNQ2145840184 (Ponto),"Cosmina NL05 BUNQ 2033 4746 07
Invoice 1321, customer gifts",,-131.36
2025-02-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0001 RF31YKQC4JYP",,6352.5
2025-02-11,TRA Bunq NL75BUNQ2145840184 (Ponto),"Helios B.V. NL31 BUNQ 2145 9961 76
40% of shares",,0.48
2025-02-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-02-06 EUR",,0.03
2025-02-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"MoneyBird B.V.
WQRVJS7L25BC7QG648CV1 7180684574796121 Direct debit authorisation for Mone",,-0.15
2025-02-04,TRA Bunq NL75BUNQ2145840184 (Ponto),"DNH*GODADDY#3468675864
DNH*GODADDY#3468675864 AMSTERDAM, NL
",,-6.04
2025-02-04,TRA Bunq NL75BUNQ2145840184 (Ponto),"Google Ireland Limited IE64 CITI 9900 5124 4170 26
GG103UY7XB",,0.97
2024-12-31,Opening balance of Bunq NL75BUNQ2145840184,,,0
Total,,,,11730.29
Revenue,,,,
Date,Reference,Description,VAT,Amount
2025-02-11,INV 2025-0001 - Medio Zorg B.V.,According to the Proposal - Module 0,21% VAT,-5250
2025-03-11,INV 2025-0002 - Medio Zorg B.V.,According to the proposal - Module 0B,21% VAT,-4000
2025-04-26,INV 2025-0003 - Patrick Burgermeister,According to Proposal: Pitch deck | Branding | Logo design,21% VAT,-1500
2025-05-01,INV 2025-0006 - Medio Zorg B.V.,According to Agreement: Module 1,21% VAT,-7000
2025-06-03,INV 2025-0007 - Medio Zorg B.V.,According to the offer: Module 2,21% VAT,-3500
2025-06-03,INV 2025-0008 - Medio Zorg B.V.,According to the offer: Module 3,21% VAT,-1750
2025-07-02,INV 2025-0009 - RebelsAI B.V.,11 dagen RebelsAI,21% VAT,-4400
Total,,,,-27350
Bank charges (46415),,,,
Date,Reference,Description,VAT,Amount
2025-07-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 28266127",,-13.99
2025-06-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 27327427",,-13.99
2025-05-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 26440727",,-13.99
2025-04-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 25456814",,-13.99
2025-03-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq BV NL89 BUNQ 2025 1055 84
invoice 24609161",,-13.99
Total,,,,-69.95
`;

const projectKeywords = [
  'Medio Zorg', 'Qualevita', 'RebelsAI', 'Patrick Burgermeister',
  'V&P Vastgoed', 'RegenEra Ventures', 'Curista', 'MatrixMeesters',
  'Astralift', 'MediCapital Solutions'
];

const categoryKeywords = {
  'Software & AI Tools': ['hubspot', 'slack', 'google', 'cursor', 'apollo', 'render', 'koyeb', 'claude', 'canva', 'moneybird', 'openai', 'anthropic', 'openrouter', 'twilio', 'coollabs', 'hetzner', 'godaddy'],
  'Salaries & Freelancers': ['catalin-stefan', 'diogo guedes', 'robijs dubas', 'salary', 'freelance', 'contractor'],
  'Taxes & Accounting': ['belastingdienst', 'taxpas', 'tax', 'accounting', 'kvk', 'digidentity'],
  'Travel & Transport': ['nlov', 'ns groep', 'q park', 'ovpay', 'transavia', 'booking.com', 'bck*ns'],
  'Office & Meetings': ['zettle', 'seats2meet', 'anyhouse', 'office', 'meeting', 'coworking', 'plnt'],
  'Bank & Payment Fees': ['bunq', 'pay.nl', 'sumup', 'stripe', 'bank fee', 'transaction fee', 'mollie'],
  'Hardware & Assets': ['back market', 'laptop', 'hardware', 'equipment', 'computer'],
  'Client Revenue': ['medio zorg', 'rebelsai', 'burgermeister', 'qualevita'],
  'Food & Groceries': ['albert heijn', 'ozan market', 'soupenzo', 'restaurant', 'griekse taverne', 'lisa', 'vialis', 'weena b.v.'],
  'Miscellaneous': ['helios b.v.', 'geniusinvest', 'eq verhoef', '50plus mobiel'],
};

export const useFinancialData = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorizeTransaction = (description: string, ledgerCategory?: string): string => {
    if (ledgerCategory && !ledgerCategory.startsWith('Revenue')) {
        return ledgerCategory;
    }

    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    return 'Uncategorized';
  };

  const extractProject = (description: string): string | undefined => {
    const desc = description.toLowerCase();
    for (const project of projectKeywords) {
      if (desc.includes(project.toLowerCase())) {
        return project;
      }
    }
    return undefined;
  };

  const parseCSV = useCallback(async (csvContent: string) => {
    setLoading(true);
    setError(null);

    try {
        const sections = csvContent.split(/\n(?=[A-Za-z\s()0-9].*,,,,)/);
        
        interface ParsedTransaction {
            Date: string;
            Reference: string;
            Description: string;
            VAT: string;
            Amount: string;
        }

        let rawBankTransactions: ParsedTransaction[] = [];
        let outstandingReceivables = 0;
        const ledgerCategoryMap = new Map<string, string>();

        for (const section of sections) {
            const lines = section.trim().split('\n');
            if (lines.length < 2) continue;

            const headerLine = lines[0];
            const sectionName = headerLine.split(',')[0].trim();
            const csvData = lines.slice(1).join('\n');

            const parsed = Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                transformHeader: header => header.trim()
            });
            
            if (parsed.errors.length > 0 && !(parsed.errors.length === 1 && parsed.errors[0].code === 'TooFewFields')) {
                 console.warn(`Parsing errors in section "${sectionName}":`, parsed.errors);
            }

            const transactions = parsed.data.filter((row: unknown) => {
                const typedRow = row as Record<string, string>;
                return typedRow.Date && typedRow.Date.match(/^\d{4}-\d{2}-\d{2}/);
            }) as ParsedTransaction[];

            if (sectionName.startsWith('Bunq NL75BUNQ')) {
                rawBankTransactions = transactions;
            } else if (sectionName === 'Accounts receivable') {
                const totalRow = parsed.data.find((row: unknown) => {
                    const typedRow = row as Record<string, string>;
                    return (typedRow.Date || "").startsWith('Total');
                }) as ParsedTransaction | undefined;
                if (totalRow) {
                    outstandingReceivables = parseFloat(totalRow.Amount) || 0;
                }
            } else if (sectionName && !['Transactions to be classified', 'Settlements', 'Cash control', 'Unbilled revenue', 'Payable VAT', 'Sales tax paid or received'].includes(sectionName)) {
                transactions.forEach(t => {
                    const cleanDescription = (t.Description || "").split('\n')[0].trim();
                    if(cleanDescription && !ledgerCategoryMap.has(cleanDescription)) {
                        ledgerCategoryMap.set(cleanDescription, sectionName);
                    }
                });
            }
        }
        
        const allTransactions: Transaction[] = rawBankTransactions.map((t: ParsedTransaction) => {
            const amount = parseFloat(t.Amount) || 0;
            const description = t.Description || '';
            const ledgerCategory = ledgerCategoryMap.get(description.split('\n')[0].trim());

            return {
                date: t.Date,
                reference: t.Reference || '',
                description: description,
                vat: t.VAT || '',
                amount: amount,
                category: categorizeTransaction(description, ledgerCategory),
                project: extractProject(description)
            };
        });

        const totalRevenue = allTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = Math.abs(allTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const currentBalance = totalRevenue - totalExpenses;

        const financialData: FinancialData = {
            allTransactions,
            totalRevenue,
            totalExpenses,
            netProfit: currentBalance,
            currentBalance,
            outstandingReceivables,
        };

        setData(financialData);

    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
    } finally {
        setLoading(false);
    }
  }, []);

  const loadSampleData = useCallback(() => {
    parseCSV(sampleCSVData);
  }, [parseCSV]);

  const uploadCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSV(content);
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const getCategoryData = useCallback((): CategoryData[] => {
    if (!data?.allTransactions) return [];

    const categoryMap = new Map<string, { revenue: number; expenses: number; transactions: Transaction[] }>();

    data.allTransactions.forEach(t => {
      const categoryName = t.category || 'Uncategorized';
      const existing = categoryMap.get(categoryName) || { revenue: 0, expenses: 0, transactions: [] };
      if (t.amount > 0) {
        existing.revenue += t.amount;
      } else {
        existing.expenses += Math.abs(t.amount);
      }
      existing.transactions.push(t);
      categoryMap.set(categoryName, existing);
    });
    
    return Array.from(categoryMap.entries()).map(([name, { revenue, expenses, transactions }]) => ({
        name,
        revenue,
        expenses,
        transactions,
        isExpense: expenses > revenue
    })).sort((a,b) => b.expenses - a.expenses);
  }, [data]);

  const getProjectData = useCallback((): ProjectData[] => {
    if (!data?.allTransactions) return [];

    const projectMap = new Map<string, Transaction[]>();

    data.allTransactions.forEach(t => {
      if (t.project) {
        const existing = projectMap.get(t.project) || [];
        projectMap.set(t.project, [...existing, t]);
      }
    });

    return Array.from(projectMap.entries()).map(([name, transactions]) => {
      const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      const netProfit = revenue - expenses;
      const roi = expenses > 0 ? (netProfit / expenses) * 100 : revenue > 0 ? Infinity : 0;

      const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastTransactionDate = sortedTransactions.length > 0 ? new Date(sortedTransactions[0].date) : new Date(0);
      const daysSinceLastTransaction = (new Date().getTime() - lastTransactionDate.getTime()) / (1000 * 3600 * 24);

      const status = daysSinceLastTransaction <= 60 ? 'Active' : 'Completed';

      return {
        name,
        revenue,
        expenses,
        netProfit,
        roi,
        status,
        transactions,
        weeks: Math.ceil(transactions.length / 2), // Heuristic
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const getMonthlyData = useCallback((): MonthlyData[] => {
    if (!data?.allTransactions) return [];

    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

    data.allTransactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { revenue: 0, expenses: 0 };

      if (t.amount > 0) {
        existing.revenue += t.amount;
      } else {
        existing.expenses += Math.abs(t.amount);
      }

      monthlyMap.set(month, existing);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, { revenue, expenses }]) => ({
        month,
        revenue,
        expenses,
        netProfit: revenue - expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  return {
    data,
    loading,
    error,
    loadSampleData,
    uploadCSV,
    getCategoryData,
    getProjectData,
    getMonthlyData,
  };
};