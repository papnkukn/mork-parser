# Mork file parser for Node.js

[Mork](https://en.wikipedia.org/wiki/Mork_(file_format)) is a textual database used by Mozilla Thunderbird **Address Book Data** (`.mab` files) and **Mail Folder Summaries** (`.msf` files).

The parser is derived from the [mork.pl](https://metacpan.org/pod/release/KRIPT/Mozilla-Mork-0.01/lib/Mozilla/Mork.pm) perl script.

Read more about [Mork Structure](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Mork/Structure).

## Getting Started

Install the module
```
npm install mork-parser
```

Use `MorkParser` to parse mork content
```javascript
const fs = require('fs');
const MorkParser = require('mork-parser');

//Read Thunderbird Address Book
var srcfile = "/Thunderbird/Profile/abook.mab";
var content = fs.readFileSync(srcfile, "utf-8");

//Parse Mork file
var mork = new MorkParser();
var records = mork.parse(content);

//Print Mork records
console.log(records);
```

## Convert Mork to JSON

Define the convert function
```javascript
const fs = require('fs');
const MorkParser = require('mork-parser');

function convert(src, dst) {
	//Read Mork file
	var content = fs.readFileSync(src, "utf-8");

	//Parse Mork file
	var mork = new MorkParser();
	var records = mork.parse(content);

	//Save to JSON file
	var json = JSON.stringify(records, " ", 2);
	fs.writeFileSync(dst, json);
}
```

Usage
```javascript
convert("path/to/inbox.msf", "path/to/output.json");
```

## Command Line Utility

Install the module globally
```
npm install -g mork-parser
```

Run the command
```
mork2json <src> <dst>
```
where `src` is path to Mork file (**.mab**, **.msf**) to parse and `dst` is path to the **.json** file to be generated.

For example
```
mork2json %APPDATA%\Thunderbird\Profiles\t2v8v38h.default\history.mab history.json
```
or
```
mork2json "$HOME/Thunderbird/Profiles/t2v8v38h.default/Mail/Local Folders/Inbox.msf" messages.json
```

## Source Code

Download the source code from GitHub repository
```
git clone https://github.com/papnkukn/mork-parser
```

Run the unit tests
```
npm test
```

## Example of a Mork file

Mork file content, in this case Thunderbird Address Book (abook.mab)
```mork
// <!-- <mdb:mork:z v="1.4"/> -->
< <(a=c)> // (f=iso-8859-1)
  (B8=Notes)(B9=LastModifiedDate)(BA=RecordKey)(BB=AddrCharSet)
  (BC=LastRecordKey)(BD=ns:addrbk:db:table:kind:pab)(BE=ListName)
  (BF=ListNickName)(C0=ListDescription)(C1=ListTotalAddresses)
  (C2=LowercaseListName)(C3=ns:addrbk:db:table:kind:deleted)
  (80=ns:addrbk:db:row:scope:card:all)
  (81=ns:addrbk:db:row:scope:list:all)
  (82=ns:addrbk:db:row:scope:data:all)(83=UID)(84=FirstName)(85=LastName)
  (86=PhoneticFirstName)(87=PhoneticLastName)(88=DisplayName)
  (89=NickName)(8A=PrimaryEmail)(8B=LowercasePrimaryEmail)
  (8C=SecondEmail)(8D=LowercaseSecondEmail)(8E=PreferMailFormat)
  (8F=PopularityIndex)(90=WorkPhone)(91=HomePhone)(92=FaxNumber)
  (93=PagerNumber)(94=CellularNumber)(95=WorkPhoneType)(96=HomePhoneType)
  (97=FaxNumberType)(98=PagerNumberType)(99=CellularNumberType)
  (9A=HomeAddress)(9B=HomeAddress2)(9C=HomeCity)(9D=HomeState)
  (9E=HomeZipCode)(9F=HomeCountry)(A0=WorkAddress)(A1=WorkAddress2)
  (A2=WorkCity)(A3=WorkState)(A4=WorkZipCode)(A5=WorkCountry)
  (A6=JobTitle)(A7=Department)(A8=Company)(A9=_AimScreenName)
  (AA=AnniversaryYear)(AB=AnniversaryMonth)(AC=AnniversaryDay)
  (AD=SpouseName)(AE=FamilyName)(AF=WebPage1)(B0=WebPage2)(B1=BirthYear)
  (B2=BirthMonth)(B3=BirthDay)(B4=Custom1)(B5=Custom2)(B6=Custom3)
  (B7=Custom4)>

<(80=0)>
{1:^80 {(k^BD:c)(s=9)} 
  [1:^82(^BC=0)]}

@$${1{@
< <(a=c)> // (f=iso-8859-1)
  (C4=_Yahoo)(C5=_MSN)(C6=DbRowID)(C7=PhotoType)(C8=_ICQ)(C9=_IRC)
  (CA=_JabberId)(CB=_Skype)(CC=PreferDisplayName)(CD=PhotoName)(CE=_QQ)
  (CF=PhotoURI)(D0=_GoogleTalk)>

<(83=1)(81=Foo Bar)(82=)(84=83b857bf-58e3-459c-8f8b-882693285721)(85
    =generic)(86=Foo)(87=Bar)(88=foo.bar@example.com)>
{-1:^80 {(k^BD:c)(s=9)} 
  [1:^82(^BC=1)]
  [-1(^88^81)(^87=)(^86=)(^C4=)(^B8=)(^A2=)(^AF=)(^C5=)(^C6=1)(^8E=0)
    (^B3=)(^A8=)(^9B=)(^B4=)(^A7=)(^A5=)(^83^84)(^93=)(^A6=)(^A4=)(^9C=)
    (^C7^85)(^9F=)(^B1=)(^8F=0)(^C8=)(^94=)(^C9=)(^A1=)(^CA=)(^CB=)
    (^9A=)(^84^86)(^A9=)(^CC=1)(^85^87)(^9D=)(^B7=)(^B9=0)(^8A^88)(^B0=)
    (^CD=)(^91=)(^B2=)(^CE=)(^90=)(^A3=)(^92=)(^89=)(^A0=)(^B5=)(^9E=)
    (^8C=)(^CF=)(^D0=)(^B6=)(^8B^88)(^BA=1)]}
@$$}1}@
```

Converted to JSON
```json
[
  {
    "LastRecordKey": "1",
    "DisplayName": "Foo Bar",
    "PhoneticLastName": "",
    "PhoneticFirstName": "",
    "_Yahoo": "",
    "Notes": "",
    "WorkCity": "",
    "WebPage1": "",
    "_MSN": "",
    "DbRowID": "1",
    "PreferMailFormat": "0",
    "BirthDay": "",
    "Company": "",
    "HomeAddress2": "",
    "Custom1": "",
    "Department": "",
    "WorkCountry": "",
    "UID": "83b857bf-58e3-459c-8f8b-882693285721",
    "PagerNumber": "",
    "JobTitle": "",
    "WorkZipCode": "",
    "HomeCity": "",
    "PhotoType": "generic",
    "HomeCountry": "",
    "BirthYear": "",
    "PopularityIndex": "0",
    "_ICQ": "",
    "CellularNumber": "",
    "_IRC": "",
    "WorkAddress2": "",
    "_JabberId": "",
    "_Skype": "",
    "HomeAddress": "",
    "FirstName": "Foo",
    "_AimScreenName": "",
    "PreferDisplayName": "1",
    "LastName": "Bar",
    "HomeState": "",
    "Custom4": "",
    "LastModifiedDate": "0",
    "PrimaryEmail": "foo.bar@example.com",
    "WebPage2": "",
    "PhotoName": "",
    "HomePhone": "",
    "BirthMonth": "",
    "_QQ": "",
    "WorkPhone": "",
    "WorkState": "",
    "FaxNumber": "",
    "NickName": "",
    "WorkAddress": "",
    "Custom2": "",
    "HomeZipCode": "",
    "SecondEmail": "",
    "PhotoURI": "",
    "_GoogleTalk": "",
    "Custom3": "",
    "LowercasePrimaryEmail": "foo.bar@example.com",
    "RecordKey": "1"
  }
]
```