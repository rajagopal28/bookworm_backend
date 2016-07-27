## Problem statement:
A typical book lover would love to buy a (paper-back) book, read it till his/her soul melts and complete it soon if that has an awesome content inside. But when the story ends, what happens to the book that kept me busy and involved for such a good amount of time? What if I have a perspective about the story or a part of the story is not clear or raising a lot of questions than it answered. What if there are people who took the story/a part of it , the way I took it or the contrary? What if my friends can explain something that I don’t get quite well from the story/a part of the story.
The solution:
Having the problem statement explained, here comes the solution in the form of an application that helps me lend/borrow books from people having common interest. Converse and share information that are immersed in a diversified collection of people with varying thought process, through forums and chats.

## Tech stack used:
The following are the technologies and libraries that I have used in this experiment. I call it my MEAN stack experiment because of the 4 major techs I’ve used.

- Mongo DB: Document based data management system which used Javascript Object Notations to save and retrieve user/books/chats related data that are the integral part of the system.
- Express JS: The application layer on top of Node JS server to enable multi route and data access support for API server that is used to process data from the front end.
    - crypto: Library to encrypt sensitive data in the system, such as user password.
    - requests: Library used to handle external API requests to third party applications used in the flow of the application.
    - mongoose: Library that used for Object Oriented design of the data system in mongo db.
    - multiparty: To handle multipart file based requests
- Angular JS: Angular JS as the interface to get connected with the backend system.
    - Bootstrap JS: Angular bootstrap library to help use various UI components that are built for angular JS in order to enhance the user experience.
- Grunt: Build the UI assets on the client side by minifying and compressing respective files for quick loading.
- Node JS: A lightweight Javascript based application server that runs the in order to process user data.
    - Socket-IO on node JS: Socke IO to have interactive chat session in the forums section.
- SmartFile drive API: A cloud based file storage system which exposed API. This is used to store the user profile pictures as of now.
- Open shift Cloud by Red-hat: The first ever cloud platform I’ve ever learnt to use on my own. The PaaS provided by Red-hat and I’ve used the free gears(VMs) provided for the free account.
- GitHub: Used for Version control and repository management.

## Challenges Faced And Lessons learnt:

- Well, I just started this experiment with just the idea as the base. I had Zero knowledge on NodeJs, MongoDb, ExpressJS, cloud deployment as they were so not related to what I’ve been working on in my 1st company, but I had around 20%knowledge in Angular JS based on the pass time pet project on Ionic.
- I knew Javascript as a client side scripting language for all my(professional) life, but how does that act as a server side language? How does it convert request to responses? How does that handle concurrency and threading? These are the sample of a huge set of questions that bewildered me when I just started this experiment. But I had a conviction that, I’ll learn a lot of good things from this unexplored area of work, the fun way.
- I started with a base story but as time evolved, I started treating it like a real website that I’m gonna create and I’ve added a whole lot of things that made sense which are missed during the initial phase.
- Initially I had no idea that there is a library/layer call Express that handles multi-routed requests, so I started with simple node JS 'hello world’ type applications.
- The same applies to mongoose library, I’ve just started with the base mongoldb layer and started with dumping data and retrieving it without any proper Object oriented modeling and design formats.
- So is the cloud related deployment, which is a very new area that I had no prior working experience. It was scary to mess with a machine which is remote and has running server packages which are not under your control directly.
- This was a whole new experience to me, as I used to work only on core backend technologies which are object oriented and tied with relational database systems in a traditional way.

## Features and Use-cases:

- Users and profiles: Create, edit and view other profiles. Update your profile pictures, which are stored in third party API calls.
- Books; lend and borrow: Lend books to the available books list and view the available books. Apply various filters and request to borrow one or more books.
- Networking: View other users, add them to your network by requesting them.
- Public and Private Forums: Open chat topics based on any book to share opinions with all users or selected users from your network.

## Repository and URL:

- GitHub: https://github.com/rajagopal28/bookworm_backend
- Live URL: http://bookworms-dextrous.rhcloud.com/#/bookworm/home


### documention yet to be updated
