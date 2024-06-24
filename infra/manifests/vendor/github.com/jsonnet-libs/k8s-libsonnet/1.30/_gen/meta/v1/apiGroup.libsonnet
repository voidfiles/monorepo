{
  local d = (import 'doc-util/main.libsonnet'),
  '#':: d.pkg(name='apiGroup', url='', help='"APIGroup contains the name, the supported versions, and the preferred version of a group."'),
  '#new':: d.fn(help='new returns an instance of APIGroup', args=[d.arg(name='name', type=d.T.string)]),
  new(name): {
    apiVersion: 'v1',
    kind: 'APIGroup',
  } + self.metadata.withName(name=name),
  '#preferredVersion':: d.obj(help='"GroupVersion contains the \\"group/version\\" and \\"version\\" string of a version. It is made a struct to keep extensibility."'),
  preferredVersion: {
    '#withGroupVersion':: d.fn(help='"groupVersion specifies the API group and version in the form \\"group/version\\', args=[d.arg(name='groupVersion', type=d.T.string)]),
    withGroupVersion(groupVersion): { preferredVersion+: { groupVersion: groupVersion } },
    '#withVersion':: d.fn(help='"version specifies the version in the form of \\"version\\". This is to save the clients the trouble of splitting the GroupVersion."', args=[d.arg(name='version', type=d.T.string)]),
    withVersion(version): { preferredVersion+: { version: version } },
  },
  '#withName':: d.fn(help='"name is the name of the group."', args=[d.arg(name='name', type=d.T.string)]),
  withName(name): { name: name },
  '#withServerAddressByClientCIDRs':: d.fn(help='"a map of client CIDR to server address that is serving this group. This is to help clients reach servers in the most network-efficient way possible. Clients can use the appropriate server address as per the CIDR that they match. In case of multiple matches, clients should use the longest matching CIDR. The server returns only those CIDRs that it thinks that the client can match. For example: the master will return an internal IP CIDR only, if the client reaches the server using an internal IP. Server looks at X-Forwarded-For header or X-Real-Ip header or request.RemoteAddr (in that order) to get the client IP."', args=[d.arg(name='serverAddressByClientCIDRs', type=d.T.array)]),
  withServerAddressByClientCIDRs(serverAddressByClientCIDRs): { serverAddressByClientCIDRs: if std.isArray(v=serverAddressByClientCIDRs) then serverAddressByClientCIDRs else [serverAddressByClientCIDRs] },
  '#withServerAddressByClientCIDRsMixin':: d.fn(help='"a map of client CIDR to server address that is serving this group. This is to help clients reach servers in the most network-efficient way possible. Clients can use the appropriate server address as per the CIDR that they match. In case of multiple matches, clients should use the longest matching CIDR. The server returns only those CIDRs that it thinks that the client can match. For example: the master will return an internal IP CIDR only, if the client reaches the server using an internal IP. Server looks at X-Forwarded-For header or X-Real-Ip header or request.RemoteAddr (in that order) to get the client IP."\n\n**Note:** This function appends passed data to existing values', args=[d.arg(name='serverAddressByClientCIDRs', type=d.T.array)]),
  withServerAddressByClientCIDRsMixin(serverAddressByClientCIDRs): { serverAddressByClientCIDRs+: if std.isArray(v=serverAddressByClientCIDRs) then serverAddressByClientCIDRs else [serverAddressByClientCIDRs] },
  '#withVersions':: d.fn(help='"versions are the versions supported in this group."', args=[d.arg(name='versions', type=d.T.array)]),
  withVersions(versions): { versions: if std.isArray(v=versions) then versions else [versions] },
  '#withVersionsMixin':: d.fn(help='"versions are the versions supported in this group."\n\n**Note:** This function appends passed data to existing values', args=[d.arg(name='versions', type=d.T.array)]),
  withVersionsMixin(versions): { versions+: if std.isArray(v=versions) then versions else [versions] },
  '#mixin': 'ignore',
  mixin: self,
}
