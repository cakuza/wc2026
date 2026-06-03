// Builds data/squads.json (keyed by project team id) from raw position-grouped roster
// blocks. Source: Al Jazeera "FIFA World Cup 2026: Full squads, all 48 teams" (June 2026).
// Names are kept as printed (ASCII, no diacritics). Shirt numbers are not published by the
// source, so number is null for every player. Parsed from raw text to avoid quote-escaping.
import { writeFileSync } from "node:fs";

const NAME_TO_ID = {
  "Turkiye": "turkey", "Brazil": "brazil", "France": "france", "Germany": "germany",
  "Argentina": "argentina", "Spain": "spain", "England": "england", "Portugal": "portugal",
  "USA": "united-states", "Mexico": "mexico", "Japan": "japan", "Morocco": "morocco",
  "Netherlands": "netherlands", "Belgium": "belgium", "Croatia": "croatia", "Switzerland": "switzerland",
  "Austria": "austria", "Norway": "norway", "South Korea": "south-korea", "Australia": "australia",
  "Saudi Arabia": "saudi-arabia", "Iran": "iran", "Qatar": "qatar", "Uzbekistan": "uzbekistan",
  "Senegal": "senegal", "Ghana": "ghana", "Egypt": "egypt", "Tunisia": "tunisia", "Algeria": "algeria",
  "Ivory Coast": "cote-divoire", "South Africa": "south-africa", "Cape Verde": "cape-verde",
  "Democratic Republic of the Congo": "dr-congo", "Canada": "canada", "Panama": "panama", "Haiti": "haiti",
  "Curacao": "curacao", "Uruguay": "uruguay", "Colombia": "colombia", "Ecuador": "ecuador",
  "Paraguay": "paraguay", "Scotland": "scotland", "Czechia": "czechia", "Sweden": "sweden",
  "New Zealand": "new-zealand", "Iraq": "iraq", "Jordan": "jordan", "Bosnia and Herzegovina": "bosnia-and-herzegovina"
};

const ALL_TEAM_IDS = Object.values(NAME_TO_ID);

const RAW = String.raw`
TEAM: Turkiye
GK: Altay Bayindir, Mert Gunok, Ugurcan Cakir
DEF: Abdulkerim Bardakci, Caglar Soyuncu, Eren Elmali, Ferdi Kadioglu, Merih Demiral, Mert Muldur, Ozan Kabak, Samet Akaydin, Zeki Celik
MID: Hakan Calhanoglu, Ismail Yuksek, Kaan Ayhan, Orkun Kokcu, Salih Ozcan
FWD: Arda Guler, Baris Alper Yilmaz, Can Uzun, Deniz Gul, Irfan Can Kahveci, Kenan Yildiz, Kerem Akturkoglu, Oguz Aydin, Yunus Akgun

TEAM: Brazil
GK: Alisson, Ederson, Weverton
DEF: Alex Sandro, Bremer, Danilo, Douglas Santos, Gabriel Magalhaes, Ibanez, Leo Pereira, Marquinhos, Wesley
MID: Bruno Guimaraes, Casemiro, Danilo Santos, Fabinho, Lucas Paqueta
FWD: Endrick, Gabriel Martinelli, Igor Thiago, Luiz Henrique, Matheus Cunha, Neymar Jr, Raphinha, Rayan, Vinicius Jr

TEAM: France
GK: Mike Maignan, Robin Risser, Brice Samba
DEF: Lucas Digne, Malo Gusto, Lucas Hernandez, Theo Hernandez, Ibrahima Konate, Maxence Lacroix, Jules Kounde, William Saliba, Dayot Upamecano
MID: N'Golo Kante, Manu Kone, Adrien Rabiot, Aurelien Tchouameni, Warren Zaire-Emery
FWD: Maghnes Akliouche, Bradley Barcola, Rayan Cherki, Ousmane Dembele, Desire Doue, Michael Olise, Kylian Mbappe, Jean-Philippe Mateta, Marcus Thuram

TEAM: Germany
GK: Manuel Neuer, Oliver Baumann, Alexander Nuebel
DEF: Nico Schlotterbeck, David Raum, Nathaniel Brown, Jonathan Tah, Waldemar Anton, Joshua Kimmich, Malick Thiaw, Antonio Rudiger
MID: Pascal Gross, Leon Goretzka, Felix Nmecha, Jamal Musiala, Nadiem Amiri, Jamie Leweling, Lennart Karl, Florian Wirtz, Leroy Sane, Aleksandar Pavlovic, Angelo Stiller
FWD: Kai Havertz, Nick Woltemade, Deniz Undav, Maximilian Beier

TEAM: Argentina
GK: Emiliano Martinez, Geronimo Rulli, Juan Musso
DEF: Leonardo Balerdi, Gonzalo Montiel, Nicolas Tagliafico, Lisandro Martinez, Cristian Romero, Nicolas Otamendi, Facundo Medina, Nahuel Molina
MID: Leandro Paredes, Rodrigo De Paul, Valentin Barco, Giovani Lo Celso, Exequiel Palacios, Alexis Mac Allister, Enzo Fernandez
FWD: Julian Alvarez, Lionel Messi, Nicolas Gonzalez, Thiago Almada, Giuliano Simeone, Nicolas Paz, Jose Manuel Lopez, Lautaro Martinez

TEAM: Spain
GK: Unai Simon, David Raya, Joan Garcia
DEF: Marc Cucurella, Pau Cubarsi, Aymeric Laporte, Alejandro Grimaldo, Pedro Porro, Eric Garcia, Marcos Llorente, Marc Pubill
MID: Gavi, Rodri, Pedri, Martin Zubimendi, Fabian Ruiz, Alex Baena, Mikel Merino
FWD: Lamine Yamal, Nico Williams, Dani Olmo, Ferran Torres, Mikel Oyarzabal, Yeremy Pino, Borja Iglesias, Victor Munoz

TEAM: England
GK: Jordan Pickford, Dean Henderson, James Trafford
DEF: Reece James, Ezri Konsa, Jarell Quansah, John Stones, Marc Guehi, Dan Burn, Nico O'Reilly, Djed Spence, Tino Livramento
MID: Declan Rice, Elliot Anderson, Kobbie Mainoo, Jordan Henderson, Morgan Rogers, Jude Bellingham, Eberechi Eze
FWD: Harry Kane, Ivan Toney, Ollie Watkins, Bukayo Saka, Marcus Rashford, Anthony Gordon, Noni Madueke

TEAM: Portugal
GK: Diogo Costa, Jose Sa, Rui Silva
DEF: Tomas Araujo, Joao Cancelo, Diogo Dalot, Ruben Dias, Goncalo Inacio, Nuno Mendes, Matheus Nunes, Nelson Semedo, Renato Veiga
MID: Samuel Costa, Bruno Fernandes, Joao Neves, Ruben Neves, Bernardo Silva, Vitinha
FWD: Francisco Conceicao, Joao Felix, Goncalo Guedes, Rafael Leao, Pedro Neto, Goncalo Ramos, Cristiano Ronaldo, Francisco Trincao

TEAM: USA
GK: Chris Brady, Matt Freese, Matt Turner
DEF: Max Arfsten, Sergino Dest, Alex Freeman, Mark McKenzie, Tim Ream, Chris Richards, Antonee Robinson, Miles Robinson, Joe Scally, Auston Trusty
MID: Tyler Adams, Sebastian Berhalter, Weston McKennie, Cristian Roldan, Brenden Aaronson, Christian Pulisic, Gio Reyna, Malik Tillman, Tim Weah, Alejandro Zendejas
FWD: Folarin Balogun, Ricardo Pepi, Haji Wright

TEAM: Mexico
GK: Raul Rangel, Guillermo Ochoa, Carlos Acevedo
DEF: Jorge Sanchez, Israel Reyes, Cesar Montes, Johan Vasquez, Jesus Gallardo, Mateo Chavez, Edson Alvarez
MID: Erik Lira, Orbelin Pineda, Alvaro Fidalgo, Brian Gutierrez, Luis Romo, Obed Vargas, Gilberto Mora, Luis Chavez
FWD: Roberto Alvarado, Cesar Huerta, Alexis Vega, Julian Quinones, Guillermo Martinez, Armando Gonzalez, Santiago Gimenez, Raul Jimenez

TEAM: Japan
GK: Tomoki Hayakawa, Keisuke Osako, Zion Suzuki
DEF: Ko Itakura, Hiroki Ito, Yuto Nagatomo, Ayumu Seko, Yukinari Sugawara, Junnosuke Suzuki, Shogo Taniguchi, Takehiro Tomiyasu, Tsuyoshi Watanabe
MID: Ritsu Doan, Wataru Endo, Junya Ito, Daichi Kamada, Takefusa Kubo, Keito Nakamura, Kaishu Sano, Ao Tanaka
FWD: Keisuke Goto, Daizen Maeda, Koki Ogawa, Kento Shiogai, Yuito Suzuki, Ayase Ueda

TEAM: Morocco
GK: Yassine Bounou, Munir El Kajoui, Ahmed Reda Tagnaouti
DEF: Noussair Mazraoui, Anas Salah-Eddine, Youssef Bellammari, Achraf Hakimi, Zakaria El Ouahdi, Nayef Aguerd, Chadi Riad, Redouane Halhal, Issa Diop
MID: Samir El Mourabet, Ayoub Bouaddi, Neil El Aynaoui, Sofyan Amrabat, Azzedine Ounahi, Bilal El Khannouss, Ismael Saibari
FWD: Abdesamad Ezzalzouli, Chemsdine Talbi, Soufiane Rahimi, Ayoub El Kaabi, Brahim Diaz, Yassine Gessim, Ayoube Amaimouni-Echghouyab

TEAM: Netherlands
GK: Mark Flekken, Robin Roefs, Bart Verbruggen
DEF: Nathan Ake, Virgil van Dijk, Denzel Dumfries, Jan Paul van Hecke, Jurrien Timber, Jorrel Hato, Micky van de Ven
MID: Ryan Gravenberch, Frenkie de Jong, Teun Koopmeiners, Tijjani Reijnders, Marten de Roon, Guus Til, Quinten Timber, Mats Wieffer
FWD: Brian Brobbey, Memphis Depay, Cody Gakpo, Noa Lang, Donyell Malen, Crysencio Summerville, Wout Weghorst, Justin Kluivert

TEAM: Belgium
GK: Thibaut Courtois, Senne Lammens, Mike Penders
DEF: Timothy Castagne, Zeno Debast, Maxim De Cuyper, Koni De Winter, Brandon Mechele, Thomas Meunier, Nathan Ngoy, Joaquin Seys, Arthur Theate
MID: Kevin De Bruyne, Amadou Onana, Nicolas Raskin, Youri Tielemans, Hans Vanaken, Axel Witsel
FWD: Charles De Ketelaere, Jeremy Doku, Matias Fernandez-Pardo, Romelu Lukaku, Dodi Lukebakio, Diego Moreira, Alexis Saelemaekers, Leandro Trossard

TEAM: Croatia
GK: Dominik Livakovic, Dominik Kotarski, Ivor Pandur
DEF: Josko Gvardiol, Duje Caleta-Car, Josip Sutalo, Josip Stanisic, Marin Pongracic, Martin Erlic, Luka Vuskovic
MID: Luka Modric, Mateo Kovacic, Mario Pasalic, Nikola Vlasic, Luka Sucic, Martin Baturina, Kristijan Jakic, Petar Sucic, Nikola Moro, Toni Fruk
FWD: Ivan Perisic, Andrej Kramaric, Ante Budimir, Marco Pasalic, Petar Musa, Igor Matanovic

TEAM: Switzerland
GK: Marvin Keller, Gregor Kobel, Yvon Mvogo
DEF: Manuel Akanji, Aurele Amenda, Eray Comert, Nico Elvedi, Luca Jaquez, Miro Muheim, Ricardo Rodriguez, Silvan Widmer
MID: Michel Aebischer, Christian Fassnacht, Remo Freuler, Ardon Jashari, Fabian Rieder, Djibril Sow, Cedric Itten, Granit Xhaka, Denis Zakaria
FWD: Ruben Vargas, Zeki Amdouni, Breel Embolo, Dan Ndoye, Noah Okafor, Johan Manzambi

TEAM: Austria
GK: Patrick Pentz, Alexander Schlager, Florian Wiegele
DEF: David Affengruber, David Alaba, Kevin Danso, Marco Friedl, Philipp Lienhart, Phillipp Mwene, Stefan Posch, Alexander Prass, Michael Svoboda
MID: Christoph Baumgartner, Carney Chukwuemeka, Florian Grillitsch, Konrad Laimer, Marcel Sabitzer, Xaver Schlager, Romano Schmid, Alessandro Schopf, Nicolas Seiwald, Paul Wanner, Patrick Wimmer
FWD: Marko Arnautovic, Michael Gregoritsch, Sasa Kalajdzic

TEAM: Norway
GK: Orjan Haskjold Nyland, Egil Selvik, Sander Tangvik
DEF: Kristoffer Vassbakk Ajer, Fredrik Bjorkan, Henrik Falchener, Sondre Langas, Torbjorn Heggem, Marcus Holmgren Pedersen, Julian Ryerson, David Moller Wolfe, Leo Ostigard
MID: Thelonious Aasgaard, Fredrik Aursnes, Patrick Berg, Sander Berge, Oscar Bobb, Jens Petter Hauge, Antonio Nusa, Andreas Schjelderup, Morten Thorsby, Kristian Thorstvedt, Martin Odegaard
FWD: Erling Haaland, Alexander Sorloth, Jorgen Strand Larsen

TEAM: South Korea
GK: Song Bumkeun, Jo Hyeonwoo, Kim Seung-gyu
DEF: Jens Castrop, Lee Hanbeom, Park Jinseob, Lee Kihyuk, Kim Minjae, Kim Moonhwan, Kim Taehyeon, Lee Taeseok, Seol Youngwoo, Cho Wije
MID: Lee Donggyeong, Hwang Heechan, Yang Hyunjun, Hwang Inbeom, Lee Jaesung, Kim Jingyu, Eom Jisung, Bae Junho, Lee Kangin, Paik Seungho
FWD: Cho Guesung, Son Heungmin, Oh Hyeongyu

TEAM: Australia
GK: Patrick Beach, Paul Izzo, Mathew Ryan
DEF: Aziz Behich, Jordan Bos, Cameron Burgess, Alessandro Circati, Milos Degenek, Jason Geria, Lucas Herrington, Jacob Italiano, Harry Souttar, Kai Trewin
MID: Cameron Devlin, Ajdin Hrustic, Jackson Irvine, Connor Metcalfe, Aiden O'Neill, Paul Okon-Engstler
FWD: Nestory Irankunda, Mathew Leckie, Awer Mabil, Mohamed Toure, Nishan Velupillay, Cristian Volpato, Tete Yengi

TEAM: Saudi Arabia
GK: Nawaf Al Aqidi, Mohamed Al Owais, Ahmed Alkassar
DEF: Saud Abdulhamid, Jehad Thakri, Abdulelah Al Amri, Hassan Tambakti, Ali Lajami, Hassan Kadesh, Moteb Al Harbi, Nawaf Boushal, Ali Majrashi, Mohammed Abu Alshamat
MID: Ziyad Al Johani, Nasser Al Dawsari, Mohamed Kanno, Abdullah Al Khaibari, Alaa Al Hejji, Musab Al Juwayr, Sultan Mandash, Ayman Yahya, Khalid Al Ghannam
FWD: Salem Al Dawsari, Abdullah Al Hamdan, Feras Al Brikan, Saleh Al Shehri

TEAM: Iran
GK: Alireza Beiranvand, Seyed Hossein Hosseini, Payam Niazmand
DEF: Danial Eiri, Ehsan Hajsafi, Saleh Hardani, Hossein Kanaani, Shoja Khalilzadeh, Milad Mohammadi, Ali Nemati, Ramin Rezaeian
MID: Rouzbeh Cheshmi, Saeid Ezatolahi, Mehdi Ghaedi, Saman Ghoddos, Mohammad Ghorbani, Alireza Jahanbakhsh, Mohammad Mohebi, Amir Mohammad Razzaghinia, Mehdi Torabi, Aria Yousefi
FWD: Ali Alipour, Dennis Dargahi, Amirhossein Hosseinzadeh, Mehdi Taremi, Shahriar Moghanlou

TEAM: Qatar
GK: Salah Zakaria, Meshaal Barsham, Mahmoud Abunada
DEF: Boualem Khoukhi, Pedro Miguel, Sultan Al Brake, Al Hashmi Al Hussain, Ayoub Al Alawi, Issa Laye, Lucas Mendes, Homam Al Amin
MID: Ahmed Fathi, Jassim Gaber, Assim Madibo, Abdulaziz Hatem, Karim Boudiaf, Mohammed Mannai
FWD: Almoez Ali, Akram Afif, Tahsin Mohammed, Edmilson Junior, Ahmed Al-Janehi, Ahmed Alaa, Hassan Al Haydos, Mohammed Muntari, Yusuf Abdurisag

TEAM: Uzbekistan
GK: Botirali Ergashev, Abduvohid Nematov, Utkir Yusupov
DEF: Abdukodir Khusanov, Khojiakbar Alijonov, Rustamjon Ashurmatov, Farrukh Sayfiev, Sherzod Nasrullaev, Umarbek Eshmuradov, Avazbek Ulmasaliev, Jakhongir Urozov, Bekhruz Karimov, Abdulla Abdullaev
MID: Akmal Mozgovoy, Otabek Shukurov, Jamshid Iskanderov, Odiljon Hamrobekov, Jaloliddin Masharipov, Azizbek Ganiev, Sherzod Esanov, Abbosbek Fayzullaev
FWD: Azizbek Amonov, Eldor Shomurodov, Igor Sergeev, Oston Urunov, Dostonbek Hamdamov

TEAM: Senegal
GK: Edouard Mendy, Mory Diaw, Yehvann Diouf
DEF: Krepin Diatta, Antoine Mendy, Kalidou Koulibaly, El Hadji Malick Diouf, Mamadou Sarr, Moussa Niakhate, Abdoulaye Seck, Ismail Jakobs
MID: Idrissa Gana Gueye, Pape Gueye, Lamine Camara, Habib Diarra, Pathe Ciss, Pape Matar Sarr, Bara Sapoko Ndiaye
FWD: Sadio Mane, Ismaila Sarr, Iliman Ndiaye, Assane Diao, Ibrahim Mbaye, Nicolas Jackson, Bamba Dieng, Cherif Ndiaye

TEAM: Ghana
GK: Joseph Anang, Benjamin Asare, Lawrence Ati-Zigi
DEF: Jonas Adjetey, Derrick Luckassen, Gideon Mensah, Abdul Mumin, Jerome Opoku, Kojo Oppong Preprah, Baba Abdul Rahman, Alidu Seidu, Marvin Senaya
MID: Augustine Boakye, Abdul Fatawu Issahaku, Elisha Owusu, Thomas Partey, Kwasi Sibo, Kamal Deen Sulemana, Caleb Yirenkyi
FWD: Prince Kwabena Adu, Jordan Ayew, Christopher Bonsu Baah, Ernest Nuamah, Antoine Semenyo, Brandon Thomas-Asante, Inaki Williams

TEAM: Egypt
GK: Mohamed El Shenawy, Mostafa Shobeir, El Mahdy Soliman, Mohamed Alaa
DEF: Mohamed Abdelmonem, Mohamed Hany, Yasser Ibrahim, Hossam Abdelmaguid, Ahmed Fattouh, Tarek Alaa, Rami Rabia, Karim Hafez
MID: Marwan Attia, Ahmed Sayed Zizo, Mahmoud Hassan Trezeguet, Emam Ashour, Mostafa Abdel Raouf, Mohannad Lasheen, Haitham Hassan, Mahmoud Saber, Ibrahim Adel, Nabil Emad, Hamdi Fathi
FWD: Mohamed Salah, Omar Marmoush, Hamza Abdel Karim

TEAM: Tunisia
GK: Sabri Ben Hessen, Abdelmouhib Chamakh, Aymen Dahman
DEF: Ali Abdi, Adem Arous, Mohamed Amine Ben Hamida, Dylan Bronn, Raed Chikhaoui, Moutaz Neffati, Omar Rekik, Montassar Talbi, Yan Valery
MID: Mortadha Ben Ouanes, Anis Ben Slimane, Ismael Gharbi, Rani Khedira, Mohamed Hadj Mahmoud, Hannibal Mejbri, Ellyes Skhiri
FWD: Elias Achouri, Khalil Ayari, Firas Chaouat, Rayan Elloumi, Hazem Mastouri, Elias Saad, Sebastian Tounekti

TEAM: Algeria
GK: Oussama Benbot, Melvin Masstil, Luca Zidane
DEF: Achraf Abada, Rayan Ait Nouri, Zinedine Belaid, Rafik Belghali, Ramy Bensebaini, Samir Chergui, Jaouen Hadjam, Aissa Mandi, Mohamed Amine Tougai
MID: Houssem Aouar, Nabil Bentaleb, Hicham Boudaoui, Fares Chaibi, Ibrahim Maza, Yassine Titraoui, Ramiz Zerrouki
FWD: Mohamed Amine Amoura, Nadir Benbouali, Adil Boulbina, Fares Ghedjemis, Amine Gouiri, Riyad Mahrez, Anis Hadj Moussa

TEAM: Ivory Coast
GK: Yahia Fofana, Mohamed Kone, Alban Lafont
DEF: Emmanuel Agbadou, Christopher Operi, Ousmane Diomande, Guela Doue, Ghislain Konan, Odilon Kossounou, Wilfried Singo, Evan Ndicka
MID: Seko Fofana, Parfait Guiagon, Christ Inao Oulai, Franck Kessie, Ibrahim Sangare, Jean Michael Seri
FWD: Simon Adingra, Ange-Yoan Bonny, Amad Diallo, Oumar Diakite, Yan Diomande, Evann Guessand, Nicolas Pepe, Bazoumana Toure, Elye Wahi

TEAM: South Africa
GK: Ronwen Williams, Ricardo Goss, Sipho Chaine
DEF: Aubrey Modiba, Khuliso Mudau, Khulumani Ndamane, Kamogelo Sebelebele, Nkosinathi Sibisi, Bradley Cross, Samukele Kabini, Olwethu Makhanya, Thabang Matuludi, Mbekezeli Mbokazi, Ime Okon
MID: Oswin Appollis, Thalente Mbatha, Relebohile Mofokeng, Jayden Adams, Teboho Mokoena, Themba Zwane, Sphephelo Sithole
FWD: Evidence Makgopa, Tshepang Moremi, Lyle Foster, Thapelo Maseko, Iqraam Rayners

TEAM: Cape Verde
GK: CJ dos Santos, Marcio Rosa, Vozinha
DEF: Sidny Cabral, Diney Borges, Logan Costa, Roberto Lopes, Steven Moreira, Wagner Pina, Kelvin Pires, Joao Paulo Fernandes, Ianique Tavares
MID: Telmo Arcanjo, Deroy Duarte, Laros Duarte, Jamiro Monteiro, Kevin Pina, Yannick Semedo
FWD: Gilson Benchimol, Jovane Cabral, Dailon Livramento, Ryan Mendes, Nuno da Costa, Garry Rodrigues, Willy Semedo, Helio Varela

TEAM: Democratic Republic of the Congo
GK: Matthieu Epolo, Timothy Fayulu, Lionel Mpasi
DEF: Dylan Batubinsika, Gedeon Kalulu, Steve Kapuadi, Joris Kayembe, Arthur Masuaku, Chancel Mbemba, Axel Tuanzebe, Aaron Wan-Bissaka
MID: Brian Cipenga, Meshack Elia, Gael Kakuta, Edo Kayembe, Nathanael Mbuku, Samuel Moutoussamy, Ngal'ayel Mukau, Charles Pickel, Noah Sadiki, Aaron Tshibola
FWD: Cedric Bakambu, Simon Banza, Fiston Mayele, Yoane Wissa, Theo Bongonda

TEAM: Canada
GK: Dayne St Clair, Maxime Crepeau, Owen Goodman
DEF: Alistair Johnston, Derek Cornelius, Richie Laryea, Niko Sigur, Joel Waterman, Luc de Fougerolles, Moise Bombito, Alphonso Davies, Alfie Jones
MID: Stephen Eustaquio, Ismael Kone, Tajon Buchanan, Mathieu Choiniere, Ali Ahmed, Nathan Saliba, Liam Millar, Jacob Shaffelburg, Jonathan Osorio
FWD: Jonathan David, Cyle Larin, Tani Oluwaseyi, Promise David

TEAM: Panama
GK: Orlando Mosquera, Luis Mejia, Cesar Samudio
DEF: Cesar Blackman, Jorge Gutierrez, Amir Murillo, Fidel Escobar, Andres Andrade, Edgardo Farina, Jose Cordoba, Eric Davis, Jiovany Ramos, Roderick Miller
MID: Anibal Godoy, Adalberto Carrasquilla, Carlos Harvey, Cristian Martinez, Jose Luis Rodriguez, Cesar Yanis, Yoel Barcenas, Alberto Quintero, Azarias Londono
FWD: Ismael Diaz, Cecilio Waterman, Jose Fajardo, Tomas Rodriguez

TEAM: Haiti
GK: Josue Duverger, Alexandre Pierre, Johny Placide
DEF: Ricardo Ade, Carlens Arcus, Hannes Delcroix, Jean-Kevin Duverne, Martin Experience, Duke Lacroix, Wilguens Paugain, Keeto Thermoncy
MID: Carl Fred Sainte, Jean-Ricner Bellegarde, Leverton Pierre, Danley Jean Jacques, Woodensky Pierre, Dominique Simon
FWD: Josue Casimir, Louicius Deedson, Derrick Etienne Jr., Yassin Fortune, Wilson Isidor, Lenny Joseph, Duckens Nazon, Frantzdy Pierrot, Ruben Providence

TEAM: Curacao
GK: Tyrick Bodack, Trevor Doornbusch, Eloy Room
DEF: Riechedly Bazoer, Joshua Brenet, Roshon van Eijma, Sherel Floranus, Deveron Fonville, Jurien Gaari, Armando Obispo, Shurandy Sambo
MID: Juninho Bacuna, Leandro Bacuna, Livano Comenencia, Kevin Felida, Ar'jany Martha, Tyrese Noslin, Godfried Roemeratoe
FWD: Jeremy Antonisse, Tahith Chong, Kenji Gorre, Sontje Hansen, Gervane Kastaneer, Brandley Kuwas, Jurgen Locadia, Jearl Margaritha

TEAM: Uruguay
GK: Sergio Rochet, Fernando Muslera, Santiago Mele
DEF: Guillermo Varela, Ronald Araujo, Jose Maria Gimenez, Santiago Bueno, Sebastian Caceres, Mathias Olivera, Joaquin Piquerez, Matias Vina
MID: Maximiliano Araujo, Giorgian de Arrascaeta, Rodrigo Bentancur, Agustin Canobbio, Nicolas de la Cruz, Emiliano Martinez, Facundo Pellistri, Brian Rodriguez, Juan Manuel Sanabria, Manuel Ugarte, Federico Valverde, Rodrigo Zalazar
FWD: Rodrigo Aguirre, Federico Vinas, Darwin Nunez

TEAM: Colombia
GK: Camilo Vargas, Alvaro Montero, David Ospina
DEF: Davinson Sanchez, Jhon Lucumi, Yerry Mina, Willer Ditta, Daniel Munoz, Santiago Arias, Johan Mojica, Deiver Machado
MID: Richard Rios, Jefferson Lerma, Kevin Castano, Juan Camilo Portilla, Gustavo Puerta, Jhon Arias, Jorge Carrascal, Juan Fernando Quintero, James Rodriguez, Jaminton Campaz
FWD: Juan Camilo Hernandez, Luis Diaz, Luis Suarez, Carlos Gomez, Jhon Cordoba

TEAM: Ecuador
GK: Hernan Galindez, Moises Ramirez, Gonzalo Valle
DEF: Piero Hincapie, Willian Pacho, Pervis Estupinan, Felix Torres, Joel Ordonez, Jackson Porozo, Angelo Preciado, Yaimar Medina
MID: Moises Caicedo, Alan Franco, Kendry Paez, Gonzalo Plata, Pedro Vite, Jordy Alcivar, Denil Castillo, John Yeboah, Nilson Angulo, Alan Minda
FWD: Enner Valencia, Kevin Rodriguez, Jordy Caicedo, Anthony Valencia, Jeremy Arevalo

TEAM: Paraguay
GK: Orlando Gill, Roberto Fernandez, Gaston Olveira
DEF: Juan Caceres, Gustavo Velazquez, Gustavo Gomez, Junior Alonso, Jose Canale, Omar Alderete, Alexandro Maidana, Fabian Balbuena
MID: Diego Gomez, Mauricio Magalhaes, Damian Bobadilla, Braian Ojeda, Andres Cubas, Matias Galarza, Alejandro Gamarra
FWD: Gustavo Caballero, Ramon Sosa, Alex Arce, Isidro Pitta, Gabriel Avalos, Miguel Almiron, Julio Enciso, Antonio Sanabria

TEAM: Scotland
GK: Craig Gordon, Angus Gunn, Liam Kelly
DEF: Grant Hanley, Jack Hendry, Aaron Hickey, Dom Hyam, Scott McKenna, Nathan Patterson, Anthony Ralston, Andy Robertson, John Souttar, Kieran Tierney
MID: Ryan Christie, Findlay Curtis, Lewis Ferguson, Tyler Fletcher, Ben Gannon-Doak, John McGinn, Kenny McLean, Scott McTominay
FWD: Che Adams, Lyndon Dykes, George Hirst, Lawrence Shankland, Ross Stewart

TEAM: Czechia
GK: Lukas Hornicek, Matej Kovar, Jindrich Stanek
DEF: Vladimir Coufal, David Doudera, Tomas Holes, Robin Hranac, Stepan Chaloupek, David Jurasek, Ladislav Krejci, Jaroslav Zeleny, David Zima
MID: Lukas Cerv, Vladimir Darida, Lukas Provod, Michal Sadilek, Hugo Sochurek, Alexandr Sojka, Tomas Soucek, Pavel Sulc, Denis Visinsky
FWD: Adam Hlozek, Tomas Chory, Mojmir Chytil, Jan Kuchta, Patrik Schick

TEAM: Sweden
GK: Viktor Johansson, Gustaf Lagerbielke, Kristoffer Nordfeldt, Jacob Zetterstrom
DEF: Hjalmar Ekdal, Gabriel Gudmundsson, Isak Hien, Victor Lindelof, Eric Smith, Carl Starfelt, Daniel Svensson
MID: Yasin Ayari, Lucas Bergvall, Jesper Karlstrom, Benjamin Nygren, Ken Sema, Elliot Stroud, Mattias Svanberg, Besfort Zeneli
FWD: Taha Ali, Alexander Bernhardsson, Anthony Elanga, Viktor Gyokeres, Alexander Isak, Gustaf Nilsson

TEAM: New Zealand
GK: Max Crocombe, Alex Paulsen, Michael Woud
DEF: Tyler Bindon, Michael Boxall, Liberato Cacace, Francis de Vries, Callan Elliot, Tim Payne, Nando Pijnaker, Tommy Smith, Finn Surman
MID: Lachlan Bayliss, Joe Bell, Matt Garbett, Eli Just, Callum McCowatt, Ben Old, Alex Rufer, Marko Stamenic, Sarpreet Singh, Ryan Thomas
FWD: Kosta Barbarouses, Jesse Randall, Ben Waine, Chris Wood

TEAM: Iraq
GK: Fahad Talib, Jalal Hassan, Ahmed Basil
DEF: Hussein Ali, Manaf Younis, Zaid Tahseen, Rebin Sulaka, Akam Hashem, Merchas Doski, Ahmed Yahya, Zaid Ismail, Frans Putros, Mustafa Saadoon
MID: Amir Al Ammari, Kevin Yakob, Zidane Iqbal, Aimar Sher, Ibrahim Bayesh, Ahmed Qasim, Youssef Amyn, Marko Farji
FWD: Ali Jassim, Ali Al Hamadi, Ali Yousef, Aymen Hussein, Mohanad Ali

TEAM: Jordan
GK: Yazid Abulaila, Noor Bani Attiah, Abdallah Al Fakhouri
DEF: Mohammad Abu Hashish, Abdullah Nasib, Hussam Abu Dhahab, Yazan Al Arab, Mohammad Abu Alnadi, Salem Obaid, Saed Al Rosan, Ehsan Haddad, Anas Badawi
MID: Amer Jamous, Noor Al Rawabdeh, Rajaei Ayed, Ibrahim Sadeh, Mohannad Abu Taha, Nizar Al Rashdan, Mohammad Al Dawoud, Mahmoud Mardahi
FWD: Mohammad Abu Zraiq, Ali Olwan, Mousa Al Tamari, Odeh Fakhoury, Ibrahim Sabra, Ali Azaizeh

TEAM: Bosnia and Herzegovina
GK: Nikola Vasilj, Martin Zlomislic, Osman Hadzikic
DEF: Sead Kolasinac, Amar Dedic, Nihad Mujakic, Nikola Katic, Tarik Muharemovic, Stjepan Radeljic, Dennis Hadzikadunic, Nidal Celik
MID: Amir Hadziahmetovic, Ivan Sunjic, Ivan Basic, Dzenis Burnic, Ermin Mahmic, Benjamin Tahirovic, Amar Memic, Armin Gigovic, Kerim Alajbegovic, Esmir Bajraktarevic
FWD: Ermedin Demirovic, Jovo Lukic, Samed Bazdar, Haris Tabakovic, Edin Dzeko
`;

// strip zero-width / joiner characters that slipped in from the source HTML
const clean = (s) => s.replace(/[​-‍⁠﻿]/g, "").replace(/\s+/g, " ").trim();

const out = {};
for (const id of ALL_TEAM_IDS) out[id] = [];

const blocks = RAW.split(/\nTEAM:\s*/).map((b) => b.trim()).filter(Boolean);
const seen = new Set();
for (const block of blocks) {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const teamName = clean(lines[0]);
  const id = NAME_TO_ID[teamName];
  if (!id) { console.warn("UNMAPPED TEAM:", JSON.stringify(teamName)); continue; }
  seen.add(id);
  const players = [];
  for (const line of lines.slice(1)) {
    const m = line.match(/^(GK|DEF|MID|FWD):\s*(.*)$/);
    if (!m) continue;
    const position = m[1];
    for (const raw of m[2].split(",")) {
      const name = clean(raw);
      if (name) players.push({ name, number: null, position });
    }
  }
  out[id] = players;
}

writeFileSync(new URL("../data/squads.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
const filled = ALL_TEAM_IDS.filter((id) => out[id].length).length;
const total = ALL_TEAM_IDS.reduce((n, id) => n + out[id].length, 0);
const missing = ALL_TEAM_IDS.filter((id) => !out[id].length);
console.log(`Teams: ${ALL_TEAM_IDS.length} | with squads: ${filled} | players: ${total}`);
if (missing.length) console.log("EMPTY:", missing.join(", "));
