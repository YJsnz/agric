PAGE 1
1 
 
Diverse Canopy of Wheat Cultivar Mixtures: A Comprehensive Image 
Dataset for Phenotyping, Phenology, and Water Stress Studies 
 
Dataset 
This dataset includes ground-based nadir images captured on 19 dates throughout two growing seasons 
(2014-15 and 2015-16) from 90 experimental plots of wheat cultivar mixtures with diverse ripening 
patterns. Half of the plots were also subjected to post-anthesis water stress (irrigated with 50% of the 
water required for Field Capacity). The experimental field was located at the School of Agriculture, Shiraz 
University, Shiraz, Iran; and all images were taken from approximately 1.5 meters above the ground 
surface. It is expected that the total of 1676 single images provided may be useful for various research 
purposes in the fields of modern phenotyping, phenology, water stress, etc. 
* It is worth noting that one of the datasets from the first season (i.e., taken 189 days after sowing) 
comprises only 56 images, due to a malfunction in the camera memory. 
 
Field experiment 
The region has a semi-arid climate and a Mediterranean pattern of precipitation with a long-term average 
annual temperature and precipitation of 13.4 °C and 386 mm (Haghshenas et al., 2021). The soil was a 
silty-clay with pH 7.9 and an organic carbon content of 0.36% (0-60 cm depth). Mixture treatments were 
15 mixing ratios of four early- to middle-ripening hard wheat cultivars [Chamran (1), Sirvan (2), Pishtaz 
(3), and Shiraz (4), respectively] including the 4 monocultures and their every 11 possible mixtures, which 
were grown with 3 replicates under two well-irrigation and post-anthesis deficit-irrigation conditions (50% 
FC). The experimental design was RCBD (Randomized Complete Block Design) in which all the 90 (2×2 
meter) plots were arranged in a lattice configuration with 1 meter distances. Plant density was 450 
plants/m2 and seeds were mixed in each year with equal ratios (i.e. 1:1, 1:1:1, and 1:1:1:1 for the 2-, 3-, 
and 4-component blends, respectively) considering their 1000-grain weights and germination 
percentages. The planting dates in the first and second growing seasons were November 20 and 
November 5, respectively; and based on the soil test, 150 kg nitrogen/ha (as urea) was applied in three 
equal splits i.e. at planting, early tillering, and anthesis. No pesticide was used and weeding was done by 
hand once at stem elongation. Irrigation was carried out using hose and flowmeter. Except for the first 
irrigations at sowing and early growth stages (two and three times in the first and second seasons), the 
majority of regular irrigations, i.e. 6 times, were applied during spring for which the irrigation interval was 
set at ten days, based on the local practices. For more information about the agronomic practices and 
application of irrigation treatments, see Haghshenas et al. (2021). 
 
Field location: 29° 43′ 48.40″ N, 52° 35′ 19″ E 
Experimental design: Randomized Complete Block Design (in a lattice arrangement) 
 
 

PAGE 2
2 
 
Imaging 
All images were taken from about 1.5 meter above the ground surface, using a common commercial 
digital camera (Canon PowerShot SX100 IS) which was set to auto mode and the constant imaging 
resolution of 8.0 megapixels (the image format is JPEG). Imaging time was mostly around the solar noon 
(or 1 or 2 hours later, based on the experimental practices). 
 
Dataset name 
The name of each package consists of three parts indicating the season, days after sowing, and date, 
respectively. For instance, the package "1stS_104DAS_20150305" includes images captured at 104 days 
after sowing (DAS) in the 1st season, i.e., on March 5, 2015. 
 
Image name 
 
For each imaging date, 90 nadir images were captured, corresponding to the 90 experimental plots of 
wheat cultivar mixtures, labeled from 1 to 30. Each label is followed by "r" and a number (1, 2, or 3), 
indicating the replicate in the experimental design. Plots 1 to 4 feature monocultures of early- to middle-
ripening wheat cultivars (Chamran [Ch], Sirvan [Sir], Pishtaz [Pish], and Shiraz [Sh], respectively). Plots 5 
to 15 represent every possible mixture of these cultivars with equal mixing ratios. Plots 16 to 30 mirror 
the first 15 treatments but undergo post-anthesis deficit irrigation, receiving 50% of the water required 
to reach soil water content to field capacity. "W" and "D" denote well- and deficit-irrigation, respectively. 
The treatments and experimental design were consistent across both growing seasons. 
 
Output of phenotyping models 
In addition to the image dataset, the outputs of two models i.e. Green-gradient based canopy 
Segmentation Model (Canopy GSM) and Canopy CCGR run using the present image dataset are also 
provided. 
 
Canopy GSM 
The output of Canopy GSM is available for all imaging dates, which is a simple image mining model 
developed to quantitatively characterize shading patterns in ground-based images of crop 
canopies. This model relies on relative variations in RGB triplets under different illuminations. 
Indeed, vegetation pixels are categorized into a maximum of 255 groups based on their green 
levels. Subsequently, the mean red and mean blue levels of each group are calculated and plotted 
against the green levels. The resulting graph (i.e., the GSM graph) can be readily utilized for: 
- 
Identifying and characterizing canopies, as one or two exponential equations; 
- 
Classifying canopy pixels based on the degree of exposure to sunlight; and 
- 
Providing valuable quantitative output values, including the coefficients of the exponential 
equations and up to 510 coordinates of points from the GSM graph. These outputs can be 
used in data mining analyses for modern phenotyping. 

PAGE 3
3 
 
For more detailed information, please see Haghshenas & Emam (2020). The user-friendly code for 
simulating the analyses is available at: https://github.com/haqueshenas/Canopy-GSM. This model 
can be also run online on Code Ocean (https://codeocean.com/capsule/1652693/tree/v2). 
 
Canopy CCGR 
Outputs of Canopy CCGR are provided for two imaging dates in the first growing season as 
examples. This model serves as a simple image processing tool designed for a novel quantitative 
phenological framework, aiming at effectively monitoring phenological trends within the canopy, 
particularly ripening. The model utilizes image-derived indices (named CC, GR, and CCGR) related 
to green coverage and its quality. For further information regarding this model and its outputs, 
please refer to Haghshenas & Emam (2019). A user-friendly version of the code for online 
execution of the model is available at: https://codeocean.com/capsule/2177070/tree/v2 
 
References 
The present dataset is used in the publications listed below: 
 Haghshenas, A., & Emam, Y. (2019). Image-based tracking of ripening in wheat cultivar mixtures: 
A quantifying approach parallel to the conventional phenology. Computers and Electronics in 
Agriculture, 156, 318-333. 
 
 Haghshenas, A., & Emam, Y. (2019). Evidence for relative grain yield simulation by red color level 
of beneath-canopy soil at wheat booting phase: An unexpected observation using image 
processing. Computers and Electronics in Agriculture, 162, 1028-1034. 
doi:https://doi.org/10.1016/j.compag.2019.05.044 
 
 Haghshenas, A., & Emam, Y. (2020). Green-gradient based canopy segmentation: A multipurpose 
image mining model with potential use in crop phenotyping and canopy studies. Computers and 
Electronics in Agriculture, 178, 105740. doi:https://doi.org/10.1016/j.compag.2020.105740 
 
 
 
 Haghshenas, A., Emam, Y., Sepaskhah, A. R., & Edalat, M. (2021). Can extended phenology in wheat 
cultivar mixtures mitigate post-anthesis water stress? European Journal of Agronomy, 122, 
126188. doi:https://doi.org/10.1016/j.eja.2020.126188 
 
 
Besides, another dataset which includes the images of cleaned grains harvested from the present 
experimental plots has been also published and is available at:  
 Haghshenas, A., Emam, Y., & Jafarizadeh, S. (2022). Images of wheat grains (used in "Wheat grain 
width: A clue for re-exploring visual indicators of grain weight"). In: figshare. 
https://figshare.com/articles/dataset/Images_of_wheat_grains/18480722 
 
 Haghshenas, A., Emam, Y., & Jafarizadeh, S. (2022). Wheat grain width: a clue for re-exploring 
visual indicators of grain weight. Plant Methods, 18(1), 58. https://doi.org/10.1186/s13007-022-
00891-1 
 
 

PAGE 4
B1
1
2
3
4
5
1
7
18
14
25
1
27
13
19
10
Start
B2
6
7
8
9
10
6
12
23
19
30
6
2
18
24
15
B3
11
12
13
14
15
11
17
28
24
5
11
7
23
29
20
B4
16
17
18
19
20
16
22
3
29
10
16
12
28
4
25
B5
21
22
23
24
25
21
27
8
4
15
21
17
3
9
30
B6
26
27
28
29
30
26
2
13
9
20
26
22
8
14
5
Plot
Plot
Plot
1
11
21
2
12
22
3
13
23
4
14
24
5
15
25
6
16
26
7
17
27
8
18
28
9
19
29
10
20
30
Experimental Design
Growing seasons: 2014‐15 & 2015‐16
Field location: 29° 43′ 48.40″ N, 52° 35′ 19″ E
Northeast
Experimental design: Randomized Complete Block Design (in a lattice arrangement)
Number of replicates: 3
Ch  (W)
Ch‐Sir‐Pish  (W)
Ch‐Pish  (D)
R 1
R 2
R 3
The blue arrows indicate the imaging path, consistent across all imaging dates.
Image name (experimental plots)
Cultivars included
Cultivars included
Cultivars included
Sir  (W)
Ch‐Sir‐Sh  (W)
Ch‐Sh  (D)
Pish  (W)
Ch‐Pish‐Sh  (W)
Sir‐Pish  (D)
Sh  (W)
Sir‐Pish‐Sh  (W)
Sir‐Sh  (D)
Ch‐sir  (W)
Ch‐Sir‐Pish‐Sh  (W)
Pish‐Sh  (D)
Ch‐Pish  (W)
Ch  (D)
Ch‐Sir‐Pish  (D)
Ch‐Sh  (W)
Sir  (D)
Ch‐Sir‐Sh  (D)
For each imaging date, 90 nadir images were captured, corresponding to the 90
experimental plots of wheat cultivar mixtures, labeled from 1 to 30. Each label is followed
by "r" and a number (1, 2, or 3), indicating the replicate in the experimental design. Plots 1
to 4 feature monocultures of early‐ to middle‐ripening wheat cultivars (Chamran [Ch],
Sirvan [Sir], Pishtaz [Pish], and Shiraz [Sh], respectively). Plots 5 to 15 represent every
possible mixture of these cultivars with equal mixing ratios. Plots 16 to 30 mirror the first
15 treatments but undergo post‐anthesis deficit irrigation, receiving 50% of the water
required to reach soil water content to field capacity. "W" and "D" denote well‐ and deficit‐
irrigation, respectively. The treatments and experimental design were consistent across
both growing seasons.
Pish‐Sh  (W)
Ch‐sir  (D)
Ch‐Sir‐Pish‐Sh  (D)
Sir‐Pish  (W)
Pish  (D)
Ch‐Pish‐Sh  (D)
Sir‐Sh  (W)
Sh  (D)
Sir‐Pish‐Sh  (D)

PAGE 5
Row Dataset
No. of 
images
Canopy status
Spikes
Imaging time (local)
Additional notes
1
1stS_104DAS_20150305
90
Green (tillering)
-
Solar noon + 0 to 2 hours
Partial weedy
2
1stS_155DAS_20150425
90
Green (booting)
-
Solar noon + 0 to 2 hours
3
1stS_175DAS_20150515
90
Green (grain filling)
Fully emerged
Solar noon + 0 to 2 hours
4
1stS_189DAS_20150529
56
Green to yellow (ripening)
Fully emerged
Solar noon + 0 to 2 hours
5
1stS_192DAS_20150601
90
Green to yellow (ripening)
Fully emerged
Solar noon + 0 to 2 hours
6
1stS_197DAS_20150606
90
Mostly rippened (yellow)
Fully emerged
Solar noon + 0 to 2 hours
7
1stS_205DAS_20150614
90
Ripened
Fully emerged
Solar noon + 0 to 2 hours
A blue plastic bar measuring 298*14 mm was placed on top of the canopy as a size scale for spike counting.
8
2ndS_47DAS_20151222
90
Green (tillering)
-
Solar noon + 0 to 2 hours
A white ping pong ball (40 mm diameter) was placed on the ground.
9
2ndS_93DAS_20160206
90
Green (tillering)
-
Solar noon + 0 to 2 hours
10
2ndS_174DAS_20160427
90
Green (booting to spike emergence)
Early emergence
9:15 to 10:00
The symptoms of moderate cold stress from the previous days are evident in the form of slight leaf discoloration.
11
2ndS_188DAS_20160511
90
Green (anthesis just finished)
Fully emerged
Solar noon + 0 to 2 hours
12
2ndS_191DAS_20160514
90
Green (grain filling)
Fully emerged
Solar noon + 0 to 2 hours
13
2ndS_194DAS_20160517
90
Green (grain filling)
Fully emerged
Solar noon + 0 to 2 hours
14
2ndS_197DAS_20160520
90
Green (grain filling)
Fully emerged
9:55 to 10:20
15
2ndS_200DAS_20160523
90
Green (grain filling)
Fully emerged
Solar noon + 0 to 2 hours
16
2ndS_208DAS_20160531
90
Green to yellow (early ripening)
Fully emerged
Solar noon + 0 to 2 hours
17
2ndS_211DAS_20160603
90
Green to yellow (ripening)
Fully emerged
Solar noon + 0 to 2 hours
18
2ndS_214DAS_20160606
90
Mostly ripened (yellow)
Fully emerged
Solar noon + 0 to 2 hours
19
2ndS_228DAS_20160620
90
Ripened
Fully emerged
Solar noon + 0 to 2 hours
A white foam cardboard (75*50 cm) with a 40*40 cm empty frame was placed at the top of canopy for spike counting.
Dataset overview
Determining the precise growing stage in canopies of cultivar mixtures with diverse phenologies poses challenges. For more detailed information on growing stage and image-based phenological approaches, refer to Haghshenas & Emam, 2019 (Fig. S13).
