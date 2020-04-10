var c = no2.select('NO2_column_number_density');

var start = ee.Date('2020-03-01');
var start2019 = start.advance(-1,'year');
var now = ee.Date(Date.now());
var now2019 = now.advance(-1,'year');

var s1 = start2019.format('YYYY-MMM-dd').cat(' to ').cat(now2019.format('YYYY-MMM-dd')).getInfo();
var s2 = start.format('YYYY-MMM-dd').cat(' to ').cat(now.format('YYYY-MMM-dd')).getInfo();

var im1 = c.filterDate(start2019,now2019).mean().multiply(1e6); //micromol
var im2 = c.filterDate(start,now).mean().multiply(1e6); //micromol

var m1 = im1.gt(50);
var m2 = im2.gt(50);

var vis = {
  min:50, 
  max:300, 
  palette:['FFFFFF','00b7ff','ffb300','ff6a00','8B0000']
};

var mapStyle = [
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      {
          "color": "#444444"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "elementType": "labels",
    "stylers": [
      {
          "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
      {
          "color": "#FFFFFF"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
          "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
          "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
      {
          "saturation": -100
      },
      {
          "lightness": 45
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
      {
          "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
      {
          "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
      {
          "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      {
          "color": "#FFFFFF"
      },
      {
          "visibility": "on"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
          "visibility": "on"
      },
      {
          "color": "#FFFFFF"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
          "color": "#444444"
      }
    ]
  }
];

ui.root.clear();
ui.root.add(ui.Map());
var Map1 = ui.root.widgets().get(0);

Map1.setOptions('mapStyle', {mapStyle: mapStyle});
Map1.setCenter(-74, 40.7, 8);
Map1.addLayer(im1.updateMask(m1),vis,'2019',true,0.6);

var linkedMap = new ui.Map();
linkedMap.setOptions('mapStyle', {mapStyle: mapStyle});
linkedMap.addLayer(im2.updateMask(m2), vis, '2020',true,0.6);

// link default Map to other map.
var linker = ui.Map.Linker([Map1, linkedMap]);

// create SplitPanel
var splitPanel = new ui.SplitPanel({
  firstPanel: linker.get(0),
  secondPanel: linker.get(1),
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

// set legend panel position
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 10px'
  }
});

// create legend title
var legendTitle = ui.Label({
  value: 'NO2 (µmol/m²)',
  style: {
    fontWeight: 'bold',
    margin: '0 0 0 0',
    padding: '0'
  }
});
 
legend.add(legendTitle);
 
// create legend image
var lat = ee.Image.pixelLonLat().select('latitude');
var gradient = lat.multiply((vis.max-vis.min)/100.0).add(vis.min);
var legendImage = gradient.visualize(vis);
 
// create text at top of legend
var panel = ui.Panel({
  widgets: [
    ui.Label(vis['max'])
  ],
});
 
legend.add(panel);
 
// create thumbnail from image
var thumbnail = ui.Thumbnail({
  image: legendImage,
  params: {bbox:'0,0,10,100', dimensions:'10x100'},
  style: {padding: '1px', position: 'bottom-left'}
});

legend.add(thumbnail);

// create text at bottom of legend
var panel = ui.Panel({
  widgets: [
    ui.Label(vis['min'])
  ],
});
 
legend.add(panel);

Map1.add(legend);
Map1.add(ui.Label(s1,{position:'top-left'}));
linkedMap.add(ui.Label(s2,{position:'top-right'}));

// set SplitPanel as only thing in root
ui.root.widgets().reset([splitPanel]);
