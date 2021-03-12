package specs

// GenerateSpartanSpec creates a spartan app spec
func GenerateSpartanSpec() (name string, ts []string, data []byte) {
	appDoc := `{
        "name": "spartan",
        "prefix": "spartan",
        "resources": [
            {
                "name": "spartan.argo.cisco.com/v1.ApplicationSpec",
                "service": "spartan",
                "endpoint": "spartan-application-spec"
            }
        ],
        "services": [
            {
                "name": "spartan",
                "endpoint": "spartan-svc-topic"
            }
        ]
    }`
	return "spartan", []string{"spartan-svc-topic", "spartan-application-spec"}, []byte(appDoc)
}
