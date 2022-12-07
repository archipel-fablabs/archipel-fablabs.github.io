// Create the map
const map = leaflet.map('archipel-map', {minZoom:9});
// Set up the OSM layer
leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add control
var customControl =  leaflet.Control.extend({
    options: {
      position: 'topleft'
    },
    onAdd: function (map) {
        let container = L.DomUtil.create('div');
        container.type="button";
        container.title="Voir tous les lieux";
        container.innerHTML = "<a href class='control-seeAll'><span class='far fa-bookmark'></span></a>";
        container.classList.add("control-seeAll-container");
        container.onclick = function(e){
            e.preventDefault();
            map.fitBounds(labMarkersGroup.getBounds())
        }
        return container;
    }
  });
map.addControl(new customControl());

// Declarations
let labs;
const labMarkers = [];
const labMarkersGroup = new L.FeatureGroup();
const labsDiv = document.getElementById("archipel-labsList");
let selectedLabIndex=0;

// get labs
fetch("https://archipel-fablabs.github.io/labs.json")
  .then(response => response.json())
  .then(json => {
    labs = json;
    /////////////////////////////////////

    // Set up labs list
    labs.forEach((lab,index) => {
        let labDiv = document.createElement('li');
        // name and address
        labDiv.innerHTML = '<span class="labName">' + lab.name + 
            '</span><br/><span class="labAddress">' + lab.address + '</span>';
        // url link
        let btnLink = document.createElement('button');
        btnLink.innerHTML = "<i class='fas fa-globe'></i> "+lab.url;
        btnLink.classList.add("archipel-btn");
        btnLink.onclick = () => window.open(lab.url);
        labDiv.append(btnLink);
        // go to location
        let btnFit = document.createElement('button');
        btnFit.innerHTML = "<i class='far fa-map'></i> voir sur la carte";
        btnFit.classList.add("archipel-btn");
        btnFit.onclick = () => fitMarker(index);
        labDiv.append(btnFit);
        // contact
        let contactLab = document.createElement('p');
        contactLab.innerHTML = " <i class='fas fa-user-alt'></i> "+lab.contact;
        contactLab.classList.add("labContact");
        labDiv.append(contactLab);
        // description
        let descLab = document.createElement('p');
        descLab.innerHTML = " <i class='fas fa-info-circle'></i> "+lab.desc;
        descLab.classList.add("labDesc");
        labDiv.append(descLab);
        // append to list
        labDiv.classList.add("labInfo");
        labsDiv.append(labDiv);
    });
    /////////////////////////////////////

    // Set up labs markers
    labs.forEach((lab, index) => {
        labMarkers[index] = new leaflet.marker(
            lab.latlng,
            {
                alt: lab.name,
                icon: leaflet.icon.glyph({
                    prefix: 'fa',
                    glyph: 'trowel',
                    className: '' // groups by color
                })
            }
        ).bindPopup('<strong>'+lab.name+'</strong>');
        labMarkersGroup.addLayer(labMarkers[index]);
        labMarkers[index].on('mouseover', function(e){
            selectLab(index);
        });
        labMarkers[index].on('keypress', function(e){
            if (e.originalEvent.key=='Enter' && e.target instanceof leaflet.Marker){
                selectLab(index);
            }
        });
        labMarkers[index].on('mouseout', function(e){
            if (map.getZoom()<14) {
                labMarkers[index].closePopup();
                labsDiv.children[index].classList.remove("archipel-labSelected");
            }
        });
        labMarkers[index].on('click', function(e){
            fitMarker(index);
        });
    });
    map.on('click', function(e){
        labsDiv.children[selectedLabIndex].classList.remove("archipel-labSelected");
    });
    labMarkersGroup.addTo(map);
    map.fitBounds(labMarkersGroup.getBounds());
    //////////////////////////////////
});

function selectLab(id){
    labMarkers[id].openPopup();
    labsDiv.children[selectedLabIndex].classList.remove("archipel-labSelected");
    selectedLabIndex = id;
    labsDiv.children[id].classList.add("archipel-labSelected");
    labsDiv.children[id].scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function fitMarker(id){
    map.flyToBounds([labs[id].latlng]);
    labMarkers[id].openPopup();
    labsDiv.children[selectedLabIndex].classList.remove("archipel-labSelected");
    labsDiv.children[id].classList.add("archipel-labSelected");
    selectedLabIndex = id;
}
