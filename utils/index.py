import rdflib
g = rdflib.Graph()
g.load('./AllBE-NorthAmerica.rdf')

for s, p, o in g:
    print(s, p, o)