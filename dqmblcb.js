String.prototype.times = function(len) {
    return len < 1 ? '' : new Array(++len).join(this.substr(0, 1) || '');
}
String.prototype.padRight = function(len, chr) {
    return this + chr.times(len - this.length);
}
String.prototype.padLeft = function(len, chr) {
    return chr.times(len - this.length) + this;
}

var csvData;
function getColorArray(s) {
    var regex = /Bl|Br|[RGBK赤青緑黒]/g;
    var m = s.match(regex);
    return m;
}
function getStyle(s) {
    switch (s) {
        case "R": case "赤": return "r";
        case "G": case "緑": return "g";
        case "B": case "青": case "Bl": return "b";
        case "K": case "黒": case "Br": return "k";
        default: return null;
    }
}
function textChanged(s, row) {
    var m = getColorArray(s);
    for (var col = 0; col < 5; col++) {
        var td = document.getElementById("td" + row + col);
        td.className = "";
        if (m != null && m.length > col) {
            var c = getStyle(m[col]);
            if (c != null) td.className = c;
        }
    }
}
function createXMLHttpRequest(cbFunc) {
    var XMLhttpObject = null;
    try { XMLhttpObject = new XMLHttpRequest(); }
    catch (e) {
        try { XMLhttpObject = new ActiveXObject("Msxml2.XMLHTTP"); }
        catch (e) {
            try { XMLhttpObject = new ActiveXObject("Microsoft.XMLHTTP"); }
            catch (e) { return null; }
        }
    }
    if (XMLhttpObject) XMLhttpObject.onreadystatechange = cbFunc;
    return XMLhttpObject;
}
function selectChanged(v) {
    if (csvData == null) return;
    for (var i = 0; i < 4; i++) {
        var t;
        (!isNaN(v)) ? t = csvData[Number(v)][i + 2] : t = "";
        document.getElementById("Text" + (i + 2)).value = t;
        textChanged(t, i + 1);
    }
}
function showData() {
    if (httpObj.readyState == 4) {
        var text = getAjaxFilter()(httpObj.responseText);
        csvData = parseCSV(text);

        var s = document.getElementById("Select1");
        s.options[0] = new Option("", "X");
        for (var i = 0; i < csvData.length; i++) {
            s.options[i + 1] = new Option(csvData[i][0].padRight(10, ' ') + csvData[i][1], i);
        }
        s.onchange = function() { selectChanged(this.value) };

        //                //ここに取得したcsvの処理を書く。ここではテーブルを表示。
        //                var result = "<table>";
        //                for (var i = 0; i < csvData.length; i++) {
        //                    result += "<tr>";
        //                    for (var j = 0; j < csvData[i].length; j++) {
        //                        result += "<td>";
        //                        result += csvData[i][j];
        //                        result += "</td>";
        //                    }
        //                    result += "</tr>";
        //                }
        //                result += "</table>";
        //                document.getElementById("result").innerHTML = result;
    }
}
function parseCSV(str) {
    var CR = String.fromCharCode(13);
    var LF = String.fromCharCode(10);
    //ここはCSVの改行コードによってCR,LFを使い分ける必要がある。
    var lines = str.split(LF);
    var csvData = new Array();

    for (var i = 0; i < lines.length; i++) {
        var cells = lines[i].split(",");
        if (cells.length != 1) csvData.push(cells);
    }
    return csvData;
}
function getAjaxFilter() {
    if (navigator.appVersion.indexOf("KHTML") > -1) {
        return function(t) {
            var esc = escape(t);
            return (esc.indexOf("%u") < 0 && esc.indexOf("%") > -1) ? decodeURIComponent(esc) : t
        }
    } else {
        return function(t) {
            return t
        }
    }
}
var timer;
function timerChanged() {
    clearInterval(timer);
    if (document.getElementById("checkboxTimer").checked) {
        var t = document.getElementById("TextTimer");
        if (!isNaN(t.value) && Number(t.value) >= 1) {
            var delay = Number(t.value) * 1000;
            timer = setInterval(function() { selectOkuri(); }, delay);
        }
    }
}
function selectOkuri() {
    var s = document.getElementById("Select1");
    var n = Number(s.value);
    if (s.options.length - 1 > ++n) {
        s.value = n;
        selectChanged(n);
    } else {
        clearInterval(timer);
        document.getElementById("checkboxTimer").checked = false;
    }
}
onload = function() {
    httpObj = createXMLHttpRequest(showData);
    httpObj.open("GET", "./dqmblcb.csv", true);
    httpObj.send("");
    document.getElementById("Select1").focus();
}
