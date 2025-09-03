// to import extractNico:
// extractNico = (await import('https://episphere.github.io/gemini/extractNico.mjs')).extractNico
let txt = await (await fetch('https://raw.githubusercontent.com/episphere/gemini/main/doc/Electronic%20path%20data%20example(Sheet1).csv')).text();
let rows = txt.split(/\r\n/).slice(0, -1)
// blank tail removed
rows = rows.map(function(row) {
    return {
        txt: row,
        report_id: row.match(/[\w]+/)[0]
    }
})
// read schema
let schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Cervical Health Data",
    "description": "A schema for recording basic cervical health indicators.",
    "type": "object",
    "properties": {
        "Chronic cervicitis": {
            "description": "Indicates the presence or absence of chronic cervicitis.",
            "type": "string",
            "enum": ["yes", "no"]
        },
        "HPV 18": {
            "description": "Indicates the presence or absence of HPV type 18.",
            "type": "string",
            "enum": ["yes", "no"]
        },
        "Transformation Zone/Endocervical Glands": {
            "description": "Indicates the presence or absence of the transformation zone or endocervical glands.",
            "type": "string",
            "enum": ["Present", "Absent"]
        }
    },
    "required": ["Chronic cervicitis", "HPV 18", "Transformation Zone/Endocervical Glands"]
}

let session = await LanguageModel.create()
// create shared session
let res = []

async function extractNico(i) {
    console.log(rows[i].txt)
    let res_i;
    if (!res[i]) {
        // use existing session
        res_i = await session.prompt(rows[i].txt, {
            responseConstraint: schema
        })
        res_i = JSON.parse(res_i)
        res[i] = res_i
    }else{
        res_i = res[i]
    }
    return {
        "Chronic cervicitis": res_i["Chronic cervicitis"],
        "HPV 18": res_i["HPV 18"],
        "Transformation Zone/Endocervical Glands": res_i["Transformation Zone/Endocervical Glands"]
    }
}

const wait = (milliseconds=1000) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function extractNico75(){
    // process initial 75 reports
    for (var i = 0; i < 75; i++) {
        wait(200);
        if (!res[i]) {
            res[i] = await extractNico(i)
        }
        console.log(i, res)
    }
    return res
}
// gemini embed
let GEM = (await import('https://episphere.github.io/gemini/gem.mjs')).GEM
let gem = new GEM
async function embed(txt){
    return await gem.embed(txt)
}

let vectors=[]
async function embedNico(i=0){
    let txt = nico.rows[i].txt
    return await embed(txt)
}

async function embedNico75(){
    for (let i=0;i<nico.rows.length;i++){
        wait(200);
        vectors[i]= await embedNico[i]
    }
}
//await gem.embed('hello world')

export {extractNico, extractNico75, session, res, rows,gem, embed, embedNico,vectors}
