<div class="work">
    <h1>Professional Work I've done</h1>

    <div class="to-show">
        <div class="content">
            <h3>Tutor / Full Stack Web Developer at TypeCodeLearn </h3>
            <p>Responsible for the creation of https://www.TypeCodeLearn.com<br>
            managed backend enterprise databases, sending timely emails and SMSs,<br>
            class purchases, course data management and user authentication and<br>
            data management of online course material and assignments</p>
            <p>2 years</p>
        </div>
        <div class="background-1"></div>
        <div class="background-2"></div>
    </div>

    <div class="to-show to-show-2">
        <div class="content">
            <h3>Undergraduate Teaching Assistant at Arizona State University</h3>
            <p>4 months/2 semesters</p>
        </div>
        <div class="background-1"></div>
        <div class="background-2"></div>
    </div>
</div>

<style>
    .work{
        font-family: 'Josefin Sans', sans-serif;
    }

    h1{
        font-size: 3rem;
        margin-top: 80px;
    }

    .to-show{
        text-align: left;
        max-width: max-content;
        margin: 15px auto;
        padding: 20px 40px;
        position : relative;
    }

    .to-show .background-1, .to-show .background-2{
        position: absolute;
        left: 0;
        top: 0;
        z-index: -2;
        width: 100%;
        height: 100%;
        transition: all 0.5s;
    }

    .to-show .background-1{
        clip-path: polygon(8% 0, 100% 3%, 89% 100%, 0 89%);
        background:lightseagreen;
    }

    .to-show:hover .background-1{
        clip-path: polygon(0 8%, 100% 0, 95% 93%, 6% 100%);
    }

    .to-show .background-2{
        clip-path: polygon(0 8%, 100% 0, 95% 93%, 6% 100%);
        background:orange;
    }

    .to-show:hover .background-2{
        clip-path: polygon(8% 0, 100% 3%, 89% 100%, 0 89%);
    }

    .to-show.to-show-2 .background-1{
        clip-path: polygon(3% 0, 100% 0, 95% 93%, 6% 100%);
        background:seagreen;
    }

    .to-show.to-show-2 .background-2{
        clip-path: polygon(3% 0, 100% 11%, 90% 100%, 4% 91%);
        background:plum;
    }

    .to-show.to-show-2:hover .background-1{
        clip-path: polygon(0 8%, 100% 0, 95% 93%, 6% 100%);
    }

    .to-show.to-show-2:hover .background-2{
        clip-path: polygon(8% 0, 100% 3%, 89% 100%, 0 89%);
    }



</style>