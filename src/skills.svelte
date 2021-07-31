<script>
const allSkillsText = `
    skill:{ability out of 5}:{categories it falls under, seperated by commas}:{extra text to add in the bottom}

    HTML:5:{Frontend}
    CSS:3:{Frontend}
    JavaScript:5:{Languages,Frontend}
    GitHub:4:{All Encompassing}
    Svelte:3:{Frontend}:{this website is made in it}
    React:3:{Frontend}
    NextJS:3:{Frontend}
    Python:5:{Languages,Backend}
    Flask:5:{Backend}
    OAuth:3:{Backend,Frontend,Services}
    Stripe:4:{Backend,Frontend,Services}:{for end user payments}
    Twilio:3:{Backend,Services}:{for sending SMSs to users}
    SendGrid:3:{Backend,Services}:{for sending Emails}
    User Authentication and Password management:4:{Backend,Frontend,Services}
    SQL:4:{Backend,Databases,Languages}
    Running Unix and Shell commands:3:{Backend, Services}
    Firestore:4:{Backend,Databases}
    MongoDB:2:{Backend,Databases}
    GIMP:3:{Graphic Design}
    InkScape:3:{Graphic Design}
    Slack's API:3:{Backend,Services}:{for automated messaging important notifications}
    Google Cloud Console:3:{Backend}
    Google App Engine:4:{Backend}
    Pull ups:1:{Physical}:{like 3}
    Push ups:2:{Physical}:{like 15, 20 if I'm determined}
    Collaboration with different developers and teams:3:{Soft Skills, Physical}
    Google Ads:2:{All Encompassing}`

let allCategoryNames = new Set(["All"])

const parseComponent = component => {
    const details = component.split(":");
    const name = details[0];
    const ranking = Number.parseFloat(details[1])
    const categories = details[2].slice(1, details[2].length - 1).split(",").map(el => el.trim());
    let bottomText = null;

    if(details[3]){
        bottomText = details[3].slice(1, details[3].length - 1)
    }

    categories.forEach(category => allCategoryNames.add(category));
    let shown = true

    return {name, ranking, categories, bottomText, shown}
}

let skills = allSkillsText
            .split("\n")
            .slice(3)
            .map(text => text.trim())
            .map(parseComponent)

allCategoryNames = [...allCategoryNames]
let allCategories = allCategoryNames.map(name => {
    if (name == "All") return {name, selected:true}
    return {name, selected:false}
});

const selectCategory = category => {
    allCategories = allCategoryNames.map(name => {
        if (name == category) return {name, selected:true}
        return {name, selected:false}
    });

    if (category == "All"){
        skills.forEach(skill => skill.shown = true)
    } else{
        for(let skill of skills){
            skill.shown = skill.categories.includes(category)
        }
    }

    skills = skills
}

const getRandomSkillType = () => {
    const rand = Math.random()

    if(rand < 0.25) return ""
    else if(rand < 0.5) return "type-2"
    else if(rand < 0.75) return "type-3"
    else return "type-4"
}

</script>

<div class="skills" id="skills">
    <h1>Stuff I have worked with / skills I have</h1>
    <div class="all-categories">
        {#each [...allCategories] as category}
            <input 
              type="button" 
              class="category {category.selected?"selected":""}" 
              value={category.name}
              on:click={selectCategory(category.name)}
              >
        {/each}
    </div>
    <div class="all-skills">
        {#each skills as skill}
            <div class="skill {skill.shown?"":"hidden"} {getRandomSkillType()}">
                <h3>{skill.name}</h3>
                <div class="ranking">{"🌟".repeat(skill.ranking)}</div>
                {#if skill.bottomText}
                    <div class="skill-text">{skill.bottomText}</div>
                {/if}
                <div class="background"></div>
            </div>
        {/each}
    </div>
</div>

<style>
    h1{
        font-size: 3rem;
    }

    .skills{
        width: 100%;
        text-align: center;
        margin-top: 100px;
        font-family: 'Josefin Sans', sans-serif;
    }

    .all-skills{
        display : flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        margin-top: 58px;
    }

    .all-skills .skill{
        margin: 10px;
        padding: 10px 20px;
        max-width: 120px;
        position: relative;
        color: white;
        transition: all 0.5s;
    }

    .all-skills .skill.hidden{
        display : none;
    }

    .all-skills .skill .ranking{
        margin: 15px auto;
        padding: 5px 10px;
        padding-top: 10px;
        max-width: max-content;
        border-radius: 5px;
    }

    .all-skills .skill .background{
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: teal;
        clip-path: polygon(7.25% 11px, 100% 0%, 80.38% 100%, 17.51% 103.57%);
        z-index: -1;
        transition: all 0.5s;
    }

    .all-skills .skill:hover{
        padding: 20px;
        
    }

    .all-skills .skill:hover .background, .all-skills .skill.skill.type-2:hover .background, .all-skills .skill.skill.type-3:hover .background, .all-skills .skill.skill.type-4:hover .background{
        clip-path: polygon(0% 0, 100% 0, 100% 100%, 0% 100%);
        background: rgb(18, 74, 139);
    }

    .all-skills .skill.type-2 .background{
        clip-path: polygon(1.74% 13px, 83.33% 3.85%, 91% 100%, 3.7% 87.68%);
        background: rgb(129, 38, 129);
    }

    .all-skills .skill.type-3 .background{
        clip-path: polygon(9.75% 27px, 83.75% 2.38%, 98.5% 92.27%, 0% 100%);
        background:lightcoral;
    }

    .all-skills .skill.type-4 .background{
        clip-path: polygon(11% 0, 100% 0%, 91% 100%, 0% 100%);
        background:rgb(141, 143, 7);
    }

    .all-skills .skill:hover .ranking{
        background: teal;
    }

    .all-categories .category{
        display: inline-block;
        margin: 10px;
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .all-categories .category.selected{
        background: teal;
        border-radius: 50px;
        color: white;
    }

    .all-categories .category:hover{
        background :rgb(18, 74, 139);
        border-radius: 50px;
        color: white;
    }
</style>