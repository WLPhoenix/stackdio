# Set the hostname of the machine based on the FQDN defined in a grain
set_hostname:
  cmd:
    - run
    - order: 1
    - name: "hostname {{ grains['fqdn'] }}"
    - unless: "hostname | grep {{ grains['fqdn'] }}"

# Add a mapping to FQDN from local IP address
append_fqdn_etc_hosts:
  file:
    - append
    - name: /etc/hosts
    - text: "{{ grains['ip_interfaces']['eth0'][0] }} {{ grains['fqdn'] }}"
  require:
    - cmd: set_hostname

/etc/hostname:
  file:
    - sed
    - before: "^.*$"
    - after: "{{ grains['fqdn'] }}"
    - require:
      - cmd: set_hostname
